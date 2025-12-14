import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    """Получение подключения к базе данных"""
    # Получаем DATABASE_URL с fallback на значение по умолчанию
    dsn = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление ролями и правами доступа
    GET /api/roles - получить все роли
    GET /api/roles?user_id=X - получить роли пользователя
    POST /api/roles - создать роль
    PUT /api/roles - обновить роль
    DELETE /api/roles - удалить роль
    POST /api/roles/assign - назначить роль пользователю
    DELETE /api/roles/assign - снять роль с пользователя
    GET /api/permissions - получить все права
    GET /api/permissions?role_id=X - получить права роли
    POST /api/permissions/assign - назначить право роли
    DELETE /api/permissions/assign - снять право с роли
    '''
    
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    query_params = event.get('queryStringParameters') or {}
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Получить роли пользователя
        if method == 'GET' and path.endswith('/roles') and 'user_id' in query_params:
            target_user_id = query_params.get('user_id')
            requester_id = event.get('user_id')
            if requester_id and str(requester_id) != str(target_user_id):
                cur.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'forbidden'}, default=str),
                    'isBase64Encoded': False
                }
            cur.execute("""
                SELECT r.*, ur.created_at as assigned_at, ur.assigned_by
                FROM roles r
                INNER JOIN user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = %s
                ORDER BY r.name
            """, (target_user_id,))
            roles = cur.fetchall()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'roles': [dict(r) for r in roles]}, default=str),
                'isBase64Encoded': False
            }
        
        # Получить все роли
        if method == 'GET' and path.endswith('/roles'):
            cur.execute("""
                SELECT r.*, 
                       COUNT(DISTINCT ur.user_id) as users_count,
                       COUNT(DISTINCT rp.permission_id) as permissions_count
                FROM roles r
                LEFT JOIN user_roles ur ON r.id = ur.role_id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                GROUP BY r.id
                ORDER BY r.name
            """)
            roles = cur.fetchall()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'roles': [dict(r) for r in roles]}, default=str),
                'isBase64Encoded': False
            }
        
        # Получить все права
        if method == 'GET' and path.endswith('/permissions'):
            role_id = query_params.get('role_id')
            user_id = query_params.get('user_id')
            action = query_params.get('action')
            
            # Получить переопределения прав пользователя
            if user_id and action == 'overrides':
                cur.execute("""
                    SELECT user_id, permission_id, granted, granted_by, created_at, updated_at
                    FROM user_permission_overrides
                    WHERE user_id = %s
                """, (user_id,))
                overrides = cur.fetchall()
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'permissions': [dict(o) for o in overrides]}, default=str),
                    'isBase64Encoded': False
                }
            
            # Получить права пользователя с учетом ролей и переопределений
            if user_id:
                requester_id = event.get('user_id')
                if requester_id and str(requester_id) != str(user_id):
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'forbidden'}, default=str),
                        'isBase64Encoded': False
                    }
                cur.execute("""
                    SELECT DISTINCT p.*,
                           CASE 
                               WHEN upo.permission_id IS NOT NULL THEN upo.granted
                               WHEN EXISTS (
                                   SELECT 1 FROM user_roles ur
                                   INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                                   WHERE ur.user_id = %s AND rp.permission_id = p.id
                               ) THEN TRUE
                               ELSE FALSE
                           END as has_permission
                    FROM permissions p
                    LEFT JOIN user_permission_overrides upo ON p.id = upo.permission_id AND upo.user_id = %s
                    ORDER BY p.category, p.name
                """, (user_id, user_id))
                permissions = cur.fetchall()
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'permissions': [dict(p) for p in permissions]}, default=str),
                    'isBase64Encoded': False
                }
            
            # Получить права роли
            if role_id:
                cur.execute("""
                    SELECT p.*, 
                           CASE WHEN rp.role_id IS NOT NULL THEN TRUE ELSE FALSE END as has_permission
                    FROM permissions p
                    LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = %s
                    ORDER BY p.category, p.name
                """, (role_id,))
                permissions = cur.fetchall()
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'permissions': [dict(p) for p in permissions]}, default=str),
                    'isBase64Encoded': False
                }
            
            # Получить все права
            cur.execute("""
                SELECT * FROM permissions
                ORDER BY category, name
            """)
            permissions = cur.fetchall()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'permissions': [dict(p) for p in permissions]}, default=str),
                'isBase64Encoded': False
            }
        
        # Создать роль
        if method == 'POST' and path.endswith('/roles'):
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            display_name = body.get('display_name')
            description = body.get('description', '')
            
            if not name or not display_name:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'name и display_name обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO roles (name, display_name, description, is_system)
                VALUES (%s, %s, %s, FALSE)
                RETURNING *
            """, (name, display_name, description))
            role = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(dict(role)),
                'isBase64Encoded': False
            }
        
        # Обновить роль
        if method == 'PUT' and path.endswith('/roles'):
            body = json.loads(event.get('body', '{}'))
            role_id = body.get('id')
            display_name = body.get('display_name')
            description = body.get('description')
            
            if not role_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE roles 
                SET display_name = COALESCE(%s, display_name),
                    description = COALESCE(%s, description),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND is_system = FALSE
                RETURNING *
            """, (display_name, description, role_id))
            role = cur.fetchone()
            
            if not role:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Роль не найдена или системная'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(role)),
                'isBase64Encoded': False
            }
        
        # Удалить роль
        if method == 'DELETE' and path.endswith('/roles'):
            role_id = query_params.get('id')
            if not role_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM roles WHERE id = %s AND is_system = FALSE RETURNING id", (role_id,))
            deleted = cur.fetchone()
            
            if not deleted:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Роль не найдена или системная'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        # Назначить роль пользователю
        if method == 'POST' and path.endswith('/roles/assign'):
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            role_id = body.get('role_id')
            assigned_by = body.get('assigned_by')
            
            if not user_id or not role_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id и role_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO user_roles (user_id, role_id, assigned_by)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, role_id) DO NOTHING
                RETURNING *
            """, (user_id, role_id, assigned_by))
            assignment = cur.fetchone()
            
            if not assignment:
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Роль уже назначена'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(dict(assignment)),
                'isBase64Encoded': False
            }
        
        # Снять роль с пользователя
        if method == 'DELETE' and path.endswith('/roles/assign'):
            user_id = query_params.get('user_id')
            role_id = query_params.get('role_id')
            
            if not user_id or not role_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id и role_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                DELETE FROM user_roles 
                WHERE user_id = %s AND role_id = %s
                RETURNING id
            """, (user_id, role_id))
            deleted = cur.fetchone()
            
            if not deleted:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Роль не назначена'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        # Назначить/снять право роли
        if method in ['POST', 'DELETE'] and path.endswith('/permissions/assign'):
            body = json.loads(event.get('body', '{}'))
            role_id = body.get('role_id')
            permission_id = body.get('permission_id')
            
            if not role_id or not permission_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'role_id и permission_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES (%s, %s)
                ON CONFLICT (role_id, permission_id) DO NOTHING
                RETURNING *
            """, (role_id, permission_id))
            assignment = cur.fetchone()
            
            if not assignment:
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Право уже назначено'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(dict(assignment)),
                'isBase64Encoded': False
            }
        
        # Снять право с роли
        if method == 'DELETE' and path.endswith('/permissions/assign'):
            role_id = query_params.get('role_id')
            permission_id = query_params.get('permission_id')
            
            if not role_id or not permission_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'role_id и permission_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                DELETE FROM role_permissions 
                WHERE role_id = %s AND permission_id = %s
                RETURNING id
            """, (role_id, permission_id))
            deleted = cur.fetchone()
            
            if not deleted:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Право не назначено'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        # Переопределение права пользователя
        if method == 'POST' and path.endswith('/permissions') and query_params.get('action') == 'user_override':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            permission_id = body.get('permission_id')
            granted = body.get('granted', True)
            granted_by = event.get('headers', {}).get('X-User-Id')
            
            if not user_id or not permission_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id и permission_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            try:
                granted_by_int = int(granted_by) if granted_by else None
            except (ValueError, TypeError):
                granted_by_int = None
            
            cur.execute("""
                INSERT INTO user_permission_overrides (user_id, permission_id, granted, granted_by)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id, permission_id) 
                DO UPDATE SET 
                    granted = EXCLUDED.granted,
                    granted_by = EXCLUDED.granted_by,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            """, (user_id, permission_id, granted, granted_by_int))
            override = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(override)),
                'isBase64Encoded': False
            }
        
        # Удалить переопределение права пользователя
        if method == 'DELETE' and path.endswith('/permissions') and query_params.get('action') == 'user_override':
            user_id = query_params.get('user_id')
            permission_id = query_params.get('permission_id')
            
            if not user_id or not permission_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id и permission_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                DELETE FROM user_permission_overrides 
                WHERE user_id = %s AND permission_id = %s
                RETURNING id
            """, (user_id, permission_id))
            deleted = cur.fetchone()
            
            if not deleted:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Переопределение не найдено'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Endpoint not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        import traceback
        print("roles handler error:", str(e))
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

