import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

class IntegrationCreate(BaseModel):
    block_id: int
    integration_type: str = Field(..., pattern='^(email|telegram|google_sheets|amocrm|bitrix24|mailchimp|unisender|webhook)$')
    config: Dict
    is_active: bool = True

class IntegrationUpdate(BaseModel):
    config: Optional[Dict] = None
    is_active: Optional[bool] = None

class FormSubmit(BaseModel):
    block_id: int
    form_data: Dict

def get_db_connection():
    # Получаем DATABASE_URL с fallback на значение по умолчанию
    dsn = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def send_email(to_email: str, subject: str, body: str, config: dict) -> bool:
    try:
        smtp_host = config.get('smtp_host', 'smtp.gmail.com')
        smtp_port = config.get('smtp_port', 587)
        smtp_user = config.get('smtp_user')
        smtp_password = config.get('smtp_password')
        from_email = config.get('from_email', smtp_user)
        
        if not all([smtp_user, smtp_password]):
            return False
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        
        html_body = f"<html><body><h2>{subject}</h2>{body}</body></html>"
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return True
    except:
        return False

def send_telegram(bot_token: str, chat_id: str, message: str) -> bool:
    try:
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        response = requests.post(url, json={'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'})
        return response.status_code == 200
    except:
        return False

def send_webhook(url: str, data: dict) -> bool:
    try:
        response = requests.post(url, json=data)
        return response.status_code in [200, 201, 204]
    except:
        return False

def format_form_data(data: dict) -> str:
    html = '<table style="border-collapse: collapse; width: 100%;">'
    for key, value in data.items():
        html += f'<tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">{key}</td><td style="border: 1px solid #ddd; padding: 8px;">{value}</td></tr>'
    html += '</table>'
    return html

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление интеграциями форм и отправка данных
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        # ROUTE: /submit - Отправка формы
        if '/submit' in path and method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            submit_data = FormSubmit(**body_data)
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute(
                "SELECT * FROM form_integrations WHERE block_id = %s AND is_active = TRUE",
                (submit_data.block_id,)
            )
            integrations = cur.fetchall()
            
            cur.close()
            conn.close()
            
            if not integrations:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'message': 'No integrations configured'}),
                    'isBase64Encoded': False
                }
            
            results = []
            formatted_data = format_form_data(submit_data.form_data)
            
            for integration in integrations:
                integration_type = integration['integration_type']
                config = integration['config']
                success = False
                
                if integration_type == 'email':
                    to_email = config.get('to_email')
                    subject = config.get('subject', 'Новая заявка с сайта')
                    success = send_email(to_email, subject, formatted_data, config)
                
                elif integration_type == 'telegram':
                    bot_token = config.get('bot_token')
                    chat_id = config.get('chat_id')
                    message = "<b>Новая заявка с сайта</b>\n\n"
                    for key, value in submit_data.form_data.items():
                        message += f"<b>{key}:</b> {value}\n"
                    success = send_telegram(bot_token, chat_id, message)
                
                elif integration_type == 'webhook':
                    webhook_url = config.get('url')
                    success = send_webhook(webhook_url, submit_data.form_data)
                
                results.append({'integration': integration_type, 'success': success})
            
            all_success = all(r['success'] for r in results)
            
            return {
                'statusCode': 200 if all_success else 207,
                'headers': headers,
                'body': json.dumps({
                    'success': all_success,
                    'message': 'Form submitted successfully' if all_success else 'Some integrations failed',
                    'results': results
                }),
                'isBase64Encoded': False
            }
        
        # ROUTE: / - CRUD интеграций
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            integration_data = IntegrationCreate(**body_data)
            
            cur.execute(
                """INSERT INTO form_integrations (block_id, integration_type, config, is_active)
                   VALUES (%s, %s, %s, %s)
                   RETURNING id, block_id, integration_type, config, is_active""",
                (integration_data.block_id, integration_data.integration_type, json.dumps(integration_data.config), integration_data.is_active)
            )
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(dict(result)),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            block_id = params.get('block_id')
            integration_id = params.get('integration_id')
            
            if integration_id:
                cur.execute("SELECT * FROM form_integrations WHERE id = %s", (integration_id,))
                integration = cur.fetchone()
                cur.close()
                conn.close()
                
                if integration:
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps(dict(integration), default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Integration not found'}),
                        'isBase64Encoded': False
                    }
            
            elif block_id:
                cur.execute("SELECT * FROM form_integrations WHERE block_id = %s ORDER BY created_at DESC", (block_id,))
                integrations = cur.fetchall()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(i) for i in integrations], default=str),
                    'isBase64Encoded': False
                }
            
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'block_id or integration_id required'}),
                    'isBase64Encoded': False
                }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            integration_id = body_data.get('integration_id')
            
            if not integration_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'integration_id required'}),
                    'isBase64Encoded': False
                }
            
            update_data = IntegrationUpdate(**body_data)
            set_clauses = []
            values = []
            
            if update_data.config is not None:
                set_clauses.append("config = %s")
                values.append(json.dumps(update_data.config))
            if update_data.is_active is not None:
                set_clauses.append("is_active = %s")
                values.append(update_data.is_active)
            
            if not set_clauses:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            set_clauses.append("updated_at = CURRENT_TIMESTAMP")
            values.append(integration_id)
            
            cur.execute(f"UPDATE form_integrations SET {', '.join(set_clauses)} WHERE id = %s RETURNING *", values)
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(result), default=str),
                'isBase64Encoded': False
            }
        
        if method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            integration_id = params.get('integration_id')
            
            if not integration_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'integration_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT id FROM form_integrations WHERE id = %s", (integration_id,))
            existing = cur.fetchone()
            
            if not existing:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Integration not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("UPDATE form_integrations SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (integration_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'Integration deactivated'}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
