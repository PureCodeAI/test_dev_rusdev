import json
import os
from datetime import datetime
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id')
    if not user_id:
        auth_header = event.get('headers', {}).get('X-User-Id')
        user_id = auth_header
    try:
        user_id = int(user_id) if user_id is not None else None
    except (ValueError, TypeError):
        user_id = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # GET /api/support/tickets - список тикетов
        if method == 'GET' and '/tickets' in path:
            ticket_id = params.get('ticket_id')
            status = params.get('status')
            category = params.get('category')
            
            if ticket_id:
                # Получить конкретный тикет с сообщениями
                cur.execute("""
                    SELECT t.*, 
                           json_agg(
                               json_build_object(
                                   'id', m.id,
                                   'user_id', m.user_id,
                                   'message', m.message,
                                   'attachments', m.attachments,
                                   'is_internal', m.is_internal,
                                   'created_at', m.created_at
                               ) ORDER BY m.created_at
                           ) FILTER (WHERE m.id IS NOT NULL) as messages
                    FROM support_tickets t
                    LEFT JOIN support_ticket_messages m ON t.id = m.ticket_id
                    WHERE t.id = %s
                    GROUP BY t.id
                """, (ticket_id,))
                ticket = cur.fetchone()
                
                if not ticket:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Ticket not found'}), 'isBase64Encoded': False}
                
                # Проверка прав доступа
                if user_id and ticket['user_id'] != user_id:
                    # Проверяем, является ли пользователь админом или поддержкой
                    cur.execute("""
                        SELECT r.name FROM user_roles ur
                        JOIN roles r ON ur.role_id = r.id
                        WHERE ur.user_id = %s AND r.name IN ('owner', 'admin', 'support')
                    """, (user_id,))
                    has_access = cur.fetchone()
                    if not has_access:
                        cur.close()
                        conn.close()
                        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
                
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(ticket), default=str), 'isBase64Encoded': False}
            
            # Список тикетов
            query = "SELECT t.*, COUNT(m.id) as messages_count FROM support_tickets t LEFT JOIN support_ticket_messages m ON t.id = m.ticket_id"
            query_params = []
            conditions = []
            
            # Если не админ/поддержка, показываем только свои тикеты
            cur.execute("""
                SELECT r.name FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = %s AND r.name IN ('owner', 'admin', 'support')
            """, (user_id,))
            is_staff = cur.fetchone()
            
            if not is_staff and user_id:
                conditions.append("t.user_id = %s")
                query_params.append(user_id)
            
            if status:
                conditions.append("t.status = %s")
                query_params.append(status)
            
            if category:
                conditions.append("t.category = %s")
                query_params.append(category)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " GROUP BY t.id ORDER BY t.created_at DESC LIMIT 100"
            
            cur.execute(query, query_params)
            tickets = cur.fetchall()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(t) for t in tickets], default=str), 'isBase64Encoded': False}
        
        # POST /api/support/tickets - создать тикет
        if method == 'POST' and '/tickets' in path:
            if not user_id:
                cur.close()
                conn.close()
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
            
            body_data = json.loads(event.get('body', '{}'))
            subject = body_data.get('subject')
            description = body_data.get('description')
            category = body_data.get('category', 'other')
            priority = body_data.get('priority', 'medium')
            related_type = body_data.get('related_type')
            related_id = body_data.get('related_id')
            
            if not subject or not description:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'subject and description required'}), 'isBase64Encoded': False}
            
            cur.execute("""
                INSERT INTO support_tickets (user_id, subject, description, category, priority, related_type, related_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (user_id, subject, description, category, priority, related_type, related_id))
            ticket = cur.fetchone()
            
            # Создаем первое сообщение
            cur.execute("""
                INSERT INTO support_ticket_messages (ticket_id, user_id, message)
                VALUES (%s, %s, %s)
                RETURNING *
            """, (ticket['id'], user_id, description))
            conn.commit()
            
            cur.close()
            conn.close()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(ticket), default=str), 'isBase64Encoded': False}
        
        # POST /api/support/messages - добавить сообщение в тикет
        if method == 'POST' and '/messages' in path:
            if not user_id:
                cur.close()
                conn.close()
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
            
            body_data = json.loads(event.get('body', '{}'))
            ticket_id = body_data.get('ticket_id')
            message = body_data.get('message')
            is_internal = body_data.get('is_internal', False)
            attachments = body_data.get('attachments', [])
            
            if not ticket_id or not message:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'ticket_id and message required'}), 'isBase64Encoded': False}
            
            # Проверяем права доступа
            cur.execute("SELECT user_id FROM support_tickets WHERE id = %s", (ticket_id,))
            ticket = cur.fetchone()
            if not ticket:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Ticket not found'}), 'isBase64Encoded': False}
            
            # Проверяем, является ли пользователь админом или поддержкой для внутренних сообщений
            if is_internal:
                cur.execute("""
                    SELECT r.name FROM user_roles ur
                    JOIN roles r ON ur.role_id = r.id
                    WHERE ur.user_id = %s AND r.name IN ('owner', 'admin', 'support')
                """, (user_id,))
                is_staff = cur.fetchone()
                if not is_staff:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Only staff can create internal messages'}), 'isBase64Encoded': False}
            
            # Проверяем, что пользователь является автором тикета или сотрудником
            if ticket['user_id'] != user_id and not is_internal:
                cur.execute("""
                    SELECT r.name FROM user_roles ur
                    JOIN roles r ON ur.role_id = r.id
                    WHERE ur.user_id = %s AND r.name IN ('owner', 'admin', 'support')
                """, (user_id,))
                is_staff = cur.fetchone()
                if not is_staff:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
            
            cur.execute("""
                INSERT INTO support_ticket_messages (ticket_id, user_id, message, attachments, is_internal)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
            """, (ticket_id, user_id, message, json.dumps(attachments), is_internal))
            message_obj = cur.fetchone()
            
            # Обновляем updated_at тикета
            cur.execute("UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (ticket_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(message_obj), default=str), 'isBase64Encoded': False}
        
        # PUT /api/support/tickets/:id - обновить тикет
        if method == 'PUT' and '/tickets' in path:
            if not user_id:
                cur.close()
                conn.close()
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
            
            body_data = json.loads(event.get('body', '{}'))
            ticket_id = body_data.get('ticket_id') or body_data.get('id')
            
            if not ticket_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'ticket_id required'}), 'isBase64Encoded': False}
            
            # Проверяем права доступа
            cur.execute("SELECT user_id, status FROM support_tickets WHERE id = %s", (ticket_id,))
            ticket = cur.fetchone()
            if not ticket:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Ticket not found'}), 'isBase64Encoded': False}
            
            # Проверяем, является ли пользователь админом или поддержкой
            cur.execute("""
                SELECT r.name FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = %s AND r.name IN ('owner', 'admin', 'support')
            """, (user_id,))
            is_staff = cur.fetchone()
            
            # Только автор или сотрудник могут обновлять
            if ticket['user_id'] != user_id and not is_staff:
                cur.close()
                conn.close()
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
            
            # Обновляем поля
            update_fields = []
            update_values = []
            
            if 'status' in body_data:
                update_fields.append("status = %s")
                update_values.append(body_data['status'])
                if body_data['status'] == 'resolved':
                    update_fields.append("resolved_at = CURRENT_TIMESTAMP")
            
            if 'priority' in body_data:
                update_fields.append("priority = %s")
                update_values.append(body_data['priority'])
            
            if 'assigned_to' in body_data and is_staff:
                update_fields.append("assigned_to = %s")
                update_values.append(body_data['assigned_to'])
            
            if not update_fields:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'No fields to update'}), 'isBase64Encoded': False}
            
            update_values.append(ticket_id)
            query = f"UPDATE support_tickets SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
            cur.execute(query, update_values)
            result = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
        
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'}), 'isBase64Encoded': False}
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

