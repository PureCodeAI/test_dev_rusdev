import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import pyotp
import qrcode
import base64
from io import BytesIO

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def handler(event, context):
    '''
    Авторизация пользователя в системе и управление 2FA
    Args: event - dict с httpMethod, body, path
          context - объект контекста выполнения
    Returns: HTTP response с токеном сессии
    '''
    method = event.get('httpMethod', 'POST')
    path = event.get('path', '')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization',
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Получаем user_id из заголовков
    user_id = None
    auth_header = event.get('headers', {}).get('X-User-Id')
    if auth_header:
        try:
            user_id = int(auth_header)
        except (ValueError, TypeError):
            pass
    
    try:
        # Получаем DATABASE_URL с fallback на значение по умолчанию
        db_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Обработка смены пароля
        if path.endswith('/change-password') and method == 'POST':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            current_password = body.get('current_password', '')
            new_password = body.get('new_password', '')
            
            if not all([current_password, new_password]):
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Все поля обязательны'}),
                    'isBase64Encoded': False
                }
            
            if len(new_password) < 8:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пароль должен содержать минимум 8 символов'}),
                    'isBase64Encoded': False
                }
            
            current_password_hash = hash_password(current_password)
            
            cur.execute(
                "SELECT id FROM users WHERE id = %s AND password_hash = %s",
                (user_id, current_password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный текущий пароль'}),
                    'isBase64Encoded': False
                }
            
            new_password_hash = hash_password(new_password)
            cur.execute(
                "UPDATE users SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (new_password_hash, user_id)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Пароль успешно изменен'}),
                'isBase64Encoded': False
            }
        
        # Генерация секрета для 2FA
        if path.endswith('/2fa/generate') and method == 'POST':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            # Генерируем секрет
            secret = pyotp.random_base32()
            
            # Сохраняем секрет (но не включаем 2FA пока не подтвержден)
            cur.execute(
                "UPDATE users SET two_factor_secret = %s, two_factor_verified = FALSE WHERE id = %s",
                (secret, user_id)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'secret': secret}),
                'isBase64Encoded': False
            }
        
        # Проверка кода 2FA при включении
        if path.endswith('/2fa/verify') and method == 'POST':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            secret = body.get('secret', '')
            code = body.get('code', '')
            
            if not all([secret, code]):
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Secret and code are required'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем код
            totp = pyotp.TOTP(secret)
            if not totp.verify(code, valid_window=1):
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный код'}),
                    'isBase64Encoded': False
                }
            
            # Включаем 2FA
            cur.execute(
                "UPDATE users SET two_factor_enabled = TRUE, two_factor_verified = TRUE WHERE id = %s AND two_factor_secret = %s",
                (user_id, secret)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': '2FA успешно активирована'}),
                'isBase64Encoded': False
            }
        
        # Отключение 2FA
        if path.endswith('/2fa/disable') and method == 'POST':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL, two_factor_verified = FALSE WHERE id = %s",
                (user_id,)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': '2FA отключена'}),
                'isBase64Encoded': False
            }
        
        # Проверка 2FA при входе
        if path.endswith('/2fa/verify-login') and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            temp_token = body.get('token', '')
            code = body.get('code', '')
            
            if not all([temp_token, code]):
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token and code are required'}),
                    'isBase64Encoded': False
                }
            
            # Находим временную сессию по токену
            cur.execute(
                "SELECT s.user_id, u.two_factor_secret, u.full_name, u.email, u.user_type, u.balance FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = %s AND s.two_factor_verified = FALSE",
                (temp_token,)
            )
            session_data = cur.fetchone()
            
            if not session_data:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Invalid token'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем код
            totp = pyotp.TOTP(session_data['two_factor_secret'])
            if not totp.verify(code, valid_window=1):
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный код'}),
                    'isBase64Encoded': False
                }
            
            # Обновляем сессию - помечаем как подтвержденную
            cur.execute(
                "UPDATE sessions SET two_factor_verified = TRUE WHERE token = %s",
                (temp_token,)
            )
            
            # Создаем постоянную сессию
            permanent_token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            
            # Получаем информацию об устройстве
            device_info = event.get('headers', {}).get('User-Agent', 'Unknown')
            ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at, two_factor_verified, device_info, ip_address) VALUES (%s, %s, %s, TRUE, %s, %s)",
                (session_data['user_id'], permanent_token, expires_at, device_info, ip_address)
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'token': permanent_token,
                    'userId': session_data['user_id'],
                    'fullName': session_data['full_name'],
                    'email': session_data['email'],
                    'userType': session_data['user_type'],
                    'balance': session_data['balance']
                }),
                'isBase64Encoded': False
            }
        
        # Получение списка сессий
        if path.endswith('/sessions') and method == 'GET':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            # Получаем текущий токен из Authorization заголовка
            auth_token = event.get('headers', {}).get('Authorization', '')
            if auth_token.startswith('Bearer '):
                auth_token = auth_token.replace('Bearer ', '')
            else:
                auth_token = event.get('headers', {}).get('X-Auth-Token', '')
            
            cur.execute(
                """SELECT id, token, device_info, ip_address, created_at, expires_at,
                   CASE WHEN token = %s THEN TRUE ELSE FALSE END as current
                   FROM sessions 
                   WHERE user_id = %s AND expires_at > CURRENT_TIMESTAMP
                   ORDER BY created_at DESC""",
                (auth_token, user_id)
            )
            sessions = cur.fetchall()
            
            # Преобразуем в нужный формат
            sessions_list = []
            for s in sessions:
                sessions_list.append({
                    'id': str(s['id']),
                    'device': s['device_info'] or 'Неизвестное устройство',
                    'location': s['ip_address'] or 'Неизвестно',
                    'lastActive': s['created_at'].strftime('%d.%m.%Y %H:%M') if s['created_at'] else '',
                    'current': s['current']
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(sessions_list, default=str),
                'isBase64Encoded': False
            }
        
        # Завершение конкретной сессии
        if '/sessions/' in path and method == 'DELETE':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            session_id = path.split('/')[-1]
            
            cur.execute(
                "DELETE FROM sessions WHERE id = %s AND user_id = %s",
                (session_id, user_id)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Сессия завершена'}),
                'isBase64Encoded': False
            }
        
        # Завершение всех сессий
        if path.endswith('/sessions') and method == 'DELETE':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "DELETE FROM sessions WHERE user_id = %s",
                (user_id,)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Все сессии завершены'}),
                'isBase64Encoded': False
            }
        
        # Обычный вход
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            email_or_phone = body.get('emailOrPhone', '').strip().lower()
            password = body.get('password', '').strip()
            
            if not all([email_or_phone, password]):
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Email/телефон и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, full_name, email, user_type, balance, two_factor_enabled, two_factor_secret FROM users WHERE (email = %s OR phone = %s) AND password_hash = %s",
                (email_or_phone, email_or_phone, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный email/телефон или пароль'}),
                    'isBase64Encoded': False
                }
            
            # Если включена 2FA, создаем временную сессию
            if user['two_factor_enabled']:
                temp_token = generate_token()
                expires_at = datetime.now() + timedelta(minutes=10)  # Временная сессия на 10 минут
                
                # Получаем информацию об устройстве
                device_info = event.get('headers', {}).get('User-Agent', 'Unknown')
                ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
                
                cur.execute(
                    "INSERT INTO sessions (user_id, token, expires_at, two_factor_verified, device_info, ip_address) VALUES (%s, %s, %s, FALSE, %s, %s)",
                    (user['id'], temp_token, expires_at, device_info, ip_address)
                )
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'requires_2fa': True,
                        'temp_token': temp_token,
                    }),
                    'isBase64Encoded': False
                }
            
            # Обычный вход без 2FA
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            
            # Получаем информацию об устройстве
            device_info = event.get('headers', {}).get('User-Agent', 'Unknown')
            ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at, device_info, ip_address) VALUES (%s, %s, %s, %s, %s)",
                (user['id'], token, expires_at, device_info, ip_address)
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'token': token,
                    'userId': user['id'],
                    'fullName': user['full_name'],
                    'email': user['email'],
                    'userType': user['user_type'],
                    'balance': user['balance']
                }),
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
        
    except KeyError:
        # База данных не настроена
        if method == 'GET':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        return {
            'statusCode': 503,
            'headers': headers,
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Server error: {str(e)}', 'trace': error_trace}),
            'isBase64Encoded': False
        }
