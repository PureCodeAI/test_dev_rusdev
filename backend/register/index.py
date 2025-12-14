import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def handler(event, context):
    '''
    Регистрация нового пользователя в системе
    Args: event - dict с httpMethod, body
          context - объект контекста выполнения
    Returns: HTTP response с токеном сессии
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        full_name = body.get('fullName', '').strip()
        email = body.get('email', '').strip().lower()
        phone = body.get('phone', '').strip()
        password = body.get('password', '').strip()
        user_type = body.get('userType', 'entrepreneur')
        
        if not all([full_name, email, phone, password]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Все поля обязательны'}),
                'isBase64Encoded': False
            }
        
        if len(password) < 8:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пароль должен содержать минимум 8 символов'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        
        # Получаем DATABASE_URL с fallback на значение по умолчанию
        db_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT id FROM users WHERE email = %s OR phone = %s",
            (email, phone)
        )
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким email или телефоном уже существует'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "INSERT INTO users (full_name, email, phone, password_hash, user_type, balance) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (full_name, email, phone, password_hash, user_type, 0)
        )
        user_id = cur.fetchone()['id']
        
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        
        # Автоматически назначаем роль "user" новому пользователю
        cur.execute(
            "SELECT id FROM roles WHERE name = 'user'"
        )
        user_role = cur.fetchone()
        if user_role:
            # Проверяем, есть ли уже пользователи (для определения assigned_by)
            cur.execute("SELECT MIN(id) as first_user_id FROM users")
            first_user = cur.fetchone()
            assigned_by = first_user['first_user_id'] if first_user and first_user['first_user_id'] else user_id
            
            cur.execute(
                "INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (%s, %s, %s) ON CONFLICT (user_id, role_id) DO NOTHING",
                (user_id, user_role['id'], assigned_by)
            )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': token,
                'userId': user_id,
                'fullName': full_name,
                'email': email,
                'userType': user_type,
                'balance': 0
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }
