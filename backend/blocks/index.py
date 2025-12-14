import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

class BlockCreate(BaseModel):
    page_id: int
    type: str
    content: Dict
    styles: Dict = {}
    position: int
    parent_id: Optional[int] = None

class BlockUpdate(BaseModel):
    content: Optional[Dict] = None
    styles: Optional[Dict] = None
    position: Optional[int] = None

def get_db_connection():
    # Получаем DATABASE_URL с fallback на значение по умолчанию
    dsn = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Универсальная функция: блоки, боты, маркетплейс, биржа
    '''
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
    
    # Универсальное извлечение user_id (query param приоритетнее, затем заголовок)
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
        # Пытаемся подключиться к БД
        conn = None
        cur = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()
        except Exception as db_error:
            # Ошибка подключения к БД - возвращаем пустые данные для GET, ошибку для POST/PUT
            error_msg = str(db_error)
            print(f"Database connection error: {error_msg}")
            
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                exchange_type = params.get('type') == 'exchange'
                
                # Для exchange возвращаем пустой массив
                if '/exchange' in path or exchange_type:
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps([]),
                        'isBase64Encoded': False
                    }
                
                # Для других GET запросов тоже пустой массив
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([]),
                    'isBase64Encoded': False
                }
            else:
                # Для POST/PUT запросов возвращаем ошибку
                return {
                    'statusCode': 503,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Database connection error',
                        'message': error_msg
                    }),
                    'isBase64Encoded': False
                }
        
        # Если подключение не удалось, но мы дошли сюда - значит ошибка была обработана выше
        if conn is None or cur is None:
            return {
                'statusCode': 503,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Database not available'
                }),
                'isBase64Encoded': False
            }
        
        # Обработка специальных типов, которые должны отдавать 200/пусто
        request_type = params.get('type')
        action = params.get('action')
        chat_type = params.get('chat_type')
        
        # Уведомления — отдаём пустой массив (или дальше можно подключить реальные данные)
        if request_type == 'notifications' and method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        
        # AI чат — история и предпочтения: возвращаем пустые структуры, если данных нет
        if request_type == 'ai_chat' and method == 'GET':
            if action == 'get_history':
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'messages': []}),
                    'isBase64Encoded': False
                }
            if action == 'get_preferences':
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'userRules': '', 'userName': ''}),
                    'isBase64Encoded': False
                }
        
        # Admin AI config — если нет данных, вернуть дефолтную структуру, а не 400
        if request_type == 'admin' and action == 'ai_config' and method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'useGlobalConfig': False,
                    'globalApiKey': '',
                    'globalApiUrl': '',
                    'globalModel': '',
                    'siteGeneration': {'enabled': False},
                    'botGeneration': {'enabled': False},
                    'courseGeneration': {'enabled': False},
                    'chats': {'enabled': True, 'aiRules': '', 'maxHistoryMessages': 20, 'model': '', 'apiKey': '', 'apiUrl': ''},
                    'chatModes': {
                        'universal': {'aiRules': '', 'temperature': 0.7, 'maxTokens': 1024},
                        'site': {'aiRules': '', 'temperature': 0.7, 'maxTokens': 1024},
                        'ads': {'aiRules': '', 'temperature': 0.7, 'maxTokens': 1024},
                        'accountant': {'aiRules': '', 'temperature': 0.7, 'maxTokens': 1024},
                    }
                }),
                'isBase64Encoded': False
            }
        
        # PRODUCTS TOP: вернуть заглушку, а не 400
        if request_type == 'products' and action == 'top' and method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'items': []}),
                'isBase64Encoded': False
            }
        
        # ADS stats/agents/list/order_package — возвращаем пустые данные
        if request_type == 'ads':
            if method == 'GET':
                if action == 'stats':
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'campaigns': [], 'geo': [], 'devices': [], 'pages': []}),
                        'isBase64Encoded': False
                    }
                if action in ['list', 'agents']:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps([]),
                        'isBase64Encoded': False
                    }
            if method == 'POST' and action == 'order_package':
                # Order package требует БД, но если БД не настроена, вернём 503
                cur.close()
                conn.close()
                return {
                    'statusCode': 503,
                    'headers': headers,
                    'body': json.dumps({'error': 'Database not configured for package order'}),
                    'isBase64Encoded': False
                }
        
        # Analytics geo/devices/pages — отдаём пустые наборы
        if request_type == 'analytics' and method == 'GET':
            if action in ['geo', 'devices', 'pages']:
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([]),
                    'isBase64Encoded': False
                }
        
        # Integrations (bank) — пустой ответ
        if ('/integrations' in path or request_type == 'integrations') and method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        
        # Transactions list — пустой ответ
        if request_type == 'transactions' and action == 'list' and method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        
        # Domains list/purchase — отдаём заглушки/ошибку 503 по-месту (purchase требует БД)
        if request_type == 'domains':
            if method == 'GET' and action == 'list':
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([]),
                    'isBase64Encoded': False
                }
            if method == 'POST' and action == 'purchase':
                # Purchase требует БД, но если БД не настроена, вернём 503
                cur.close()
                conn.close()
                return {
                    'statusCode': 503,
                    'headers': headers,
                    'body': json.dumps({'error': 'Database not configured for domain purchase'}),
                    'isBase64Encoded': False
                }
        
        # Marketplace через type и action параметры
        if request_type == 'marketplace' and method == 'GET':
            if action == 'list':
                params = event.get('queryStringParameters') or {}
                seller_id = params.get('seller_id')
                category = params.get('category')
                search = params.get('search', '')
                
                query = "SELECT * FROM marketplace_items WHERE moderation_status = 'approved'"
                query_params = []
                if seller_id:
                    query += " AND seller_id = %s"
                    query_params.append(seller_id)
                if category and category != 'all':
                    query += " AND category = %s"
                    query_params.append(category)
                if search:
                    query += " AND (title ILIKE %s OR description ILIKE %s)"
                    query_params.extend([f'%{search}%', f'%{search}%'])
                query += " ORDER BY created_at DESC LIMIT 50"
                
                cur.execute(query, query_params)
                items = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(i) for i in items], default=str), 'isBase64Encoded': False}
            
            if action == 'purchases':
                params = event.get('queryStringParameters') or {}
                buyer_id = params.get('buyer_id')
                if buyer_id:
                    cur.execute(
                        """SELECT mp.*, mi.title, mi.preview_image 
                           FROM marketplace_purchases mp
                           JOIN marketplace_items mi ON mp.item_id = mi.id
                           WHERE mp.buyer_id = %s
                           ORDER BY mp.purchased_at DESC""",
                        (buyer_id,)
                    )
                    purchases = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(p) for p in purchases], default=str), 'isBase64Encoded': False}
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([]), 'isBase64Encoded': False}
            
            if action == 'earnings':
                params = event.get('queryStringParameters') or {}
                seller_id = params.get('seller_id')
                if seller_id:
                    cur.execute(
                        """SELECT COALESCE(SUM(mp.price * 0.7), 0) as total
                           FROM marketplace_purchases mp
                           JOIN marketplace_items mi ON mp.item_id = mi.id
                           WHERE mi.seller_id = %s AND mp.status IN ('delivered', 'completed')""",
                        (seller_id,)
                    )
                    result = cur.fetchone()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'total': 0}), 'isBase64Encoded': False}
        
        # Пустой type — отдать 400 с понятным сообщением
        if request_type is None and '/blocks' in path and method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'type is required'}),
                'isBase64Encoded': False
            }
        
        # ========== BOTS ROUTES ==========
        if '/bots' in path:
            if '/nodes' in path:
                if method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    cur.execute(
                        """INSERT INTO bot_nodes (bot_id, node_type, title, content, position_x, position_y)
                           VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
                        (body_data['bot_id'], body_data['node_type'], body_data.get('title'), 
                         json.dumps(body_data.get('content', {})), body_data.get('position_x', 0), body_data.get('position_y', 0))
                    )
                    result = cur.fetchone()
                    conn.commit()
                    cur.close()
                    conn.close()
                    return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
                
                if method == 'GET':
                    bot_id = (event.get('queryStringParameters') or {}).get('bot_id')
                    cur.execute("SELECT * FROM bot_nodes WHERE bot_id = %s", (bot_id,))
                    nodes = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(n) for n in nodes], default=str), 'isBase64Encoded': False}
            
            if '/connections' in path:
                if method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    cur.execute(
                        """INSERT INTO bot_connections (bot_id, source_node_id, target_node_id, condition_type, condition_value)
                           VALUES (%s, %s, %s, %s, %s) RETURNING *""",
                        (body_data['bot_id'], body_data['source_node_id'], body_data['target_node_id'], 
                         body_data.get('condition_type'), body_data.get('condition_value'))
                    )
                    result = cur.fetchone()
                    conn.commit()
                    cur.close()
                    conn.close()
                    return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
                
                if method == 'GET':
                    bot_id = (event.get('queryStringParameters') or {}).get('bot_id')
                    cur.execute("SELECT * FROM bot_connections WHERE bot_id = %s", (bot_id,))
                    connections = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(c) for c in connections], default=str), 'isBase64Encoded': False}
            
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                cur.execute(
                    """INSERT INTO bots (user_id, name, description, platform, settings)
                       VALUES (%s, %s, %s, %s, '{}') RETURNING *""",
                    (body_data['user_id'], body_data['name'], body_data.get('description'), body_data['platform'])
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                user_id = params.get('user_id')
                bot_id = params.get('bot_id')
                if bot_id:
                    cur.execute("SELECT * FROM bots WHERE id = %s", (bot_id,))
                    bot = cur.fetchone()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200 if bot else 404, 'headers': headers, 
                           'body': json.dumps(dict(bot) if bot else {'error': 'Not found'}, default=str), 'isBase64Encoded': False}
                cur.execute("SELECT * FROM bots WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
                bots = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(b) for b in bots], default=str), 'isBase64Encoded': False}
        
        # ========== MARKETPLACE ROUTES ==========
        if '/marketplace' in path:
            if '/purchase' in path and method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                item_id = body_data['item_id']
                buyer_id = body_data['buyer_id']
                
                # Получаем информацию о товаре
                cur.execute("""
                    SELECT price, delivery_type, seller_id 
                    FROM marketplace_items 
                    WHERE id = %s AND is_active = TRUE
                """, (item_id,))
                item = cur.fetchone()
                if not item:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Item not found'}), 'isBase64Encoded': False}
                
                # Создаем покупку (триггер автоматически выдаст товар если delivery_type = 'auto' или 'repeatable')
                cur.execute(
                    """INSERT INTO marketplace_purchases 
                       (buyer_id, item_id, seller_id, price, currency, status, delivery_type)
                       VALUES (%s, %s, %s, %s, 'RUB', 'pending', %s) RETURNING *""",
                    (buyer_id, item_id, item['seller_id'], item['price'], item['delivery_type'])
                )
                purchase_result = cur.fetchone()
                
                # Триггер автоматически обновит статус на 'delivered' и заполнит delivered_content/delivered_file_url
                # Нужно получить обновленные данные после срабатывания триггера
                cur.execute("SELECT * FROM marketplace_purchases WHERE id = %s", (purchase_result['id'],))
                purchase_result = cur.fetchone()
                
                # Получаем информацию о выданном товаре (если автовыдача сработала)
                delivered_content = purchase_result.get('delivered_content')
                delivered_file_url = purchase_result.get('delivered_file_url')
                
                cur.execute("UPDATE marketplace_items SET sales_count = sales_count + 1 WHERE id = %s", (item_id,))
                conn.commit()
                
                # Возвращаем покупку с информацией о выданном товаре
                response_data = dict(purchase_result)
                if delivered_content:
                    response_data['delivered_content'] = delivered_content
                if delivered_file_url:
                    response_data['delivered_file_url'] = delivered_file_url
                
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(response_data, default=str), 'isBase64Encoded': False}
            
            if '/review' in path:
                if method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    cur.execute(
                        """INSERT INTO marketplace_reviews (item_id, user_id, rating, comment)
                           VALUES (%s, %s, %s, %s) RETURNING *""",
                        (body_data['item_id'], body_data['user_id'], body_data['rating'], body_data.get('comment'))
                    )
                    result = cur.fetchone()
                    cur.execute("SELECT AVG(rating)::DECIMAL(3,2) as avg FROM marketplace_reviews WHERE item_id = %s", (body_data['item_id'],))
                    avg = cur.fetchone()
                    cur.execute("UPDATE marketplace_items SET rating = %s WHERE id = %s", (avg['avg'], body_data['item_id']))
                    conn.commit()
                    cur.close()
                    conn.close()
                    return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
                
                if method == 'GET':
                    item_id = (event.get('queryStringParameters') or {}).get('item_id')
                    cur.execute("SELECT * FROM marketplace_reviews WHERE item_id = %s ORDER BY created_at DESC", (item_id,))
                    reviews = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(r) for r in reviews], default=str), 'isBase64Encoded': False}
            
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                cur.execute(
                    """INSERT INTO marketplace_items (seller_id, title, description, category, item_type, price)
                       VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
                    (body_data['seller_id'], body_data['title'], body_data.get('description'), 
                     body_data['category'], body_data['item_type'], body_data['price'])
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                item_id = params.get('item_id')
                category = params.get('category')
                search = params.get('search', '')
                limit = int(params.get('limit', 50))
                
                if item_id:
                    cur.execute("SELECT * FROM marketplace_items WHERE id = %s", (item_id,))
                    item = cur.fetchone()
                    if item:
                        cur.execute("UPDATE marketplace_items SET views_count = views_count + 1 WHERE id = %s", (item_id,))
                        conn.commit()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200 if item else 404, 'headers': headers, 
                           'body': json.dumps(dict(item) if item else {'error': 'Not found'}, default=str), 'isBase64Encoded': False}
                
                query = "SELECT * FROM marketplace_items WHERE is_active = TRUE"
                query_params = []
                if category:
                    query += " AND category = %s"
                    query_params.append(category)
                if search:
                    query += " AND (title ILIKE %s OR description ILIKE %s)"
                    query_params.extend([f'%{search}%', f'%{search}%'])
                query += " ORDER BY created_at DESC LIMIT %s"
                query_params.append(limit)
                
                cur.execute(query, query_params)
                items = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(i) for i in items], default=str), 'isBase64Encoded': False}
        
        # ========== ERROR REPORT ROUTE ==========
        if '/error-report' in path and method == 'POST':
            try:
                # Просто пишем в лог/возвращаем 200 без БД, чтобы не падать без DATABASE_URL
                report_body = event.get('body', '{}')
                print("Error report received:", report_body)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'status': 'ok'}),
                    'isBase64Encoded': False
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }

        # ========== NEWSLETTER ROUTES ==========
        if '/newsletter' in path:
            if '/subscribe' in path and method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                email = body_data.get('email', '').strip().lower()
                source = body_data.get('source', 'footer')
                
                if not email or '@' not in email:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid email address'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем, существует ли уже подписка
                cur.execute("SELECT id FROM newsletter_subscriptions WHERE email = %s", (email,))
                existing = cur.fetchone()
                
                if existing:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 409,
                        'headers': headers,
                        'body': json.dumps({'error': 'Email already subscribed', 'message': 'Этот email уже подписан на рассылку'}),
                        'isBase64Encoded': False
                    }
                
                # Получаем IP и User-Agent из заголовков
                request_context = event.get('requestContext', {})
                ip_address = request_context.get('identity', {}).get('sourceIp') or 'unknown'
                user_agent = event.get('headers', {}).get('User-Agent') or 'unknown'
                
                # Получаем user_id если есть авторизация
                user_id = None
                auth_header = event.get('headers', {}).get('X-User-Id')
                if auth_header:
                    try:
                        user_id = int(auth_header)
                    except (ValueError, TypeError):
                        pass
                
                # Добавляем подписку
                cur.execute(
                    """INSERT INTO newsletter_subscriptions (email, source, user_id, ip_address, user_agent, is_active)
                       VALUES (%s, %s, %s, %s, %s, TRUE) RETURNING *""",
                    (email, source, user_id, ip_address, user_agent)
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(result), default=str),
                    'isBase64Encoded': False
                }
            
            if '/subscribers' in path and method == 'GET':
                params = event.get('queryStringParameters') or {}
                active_only = params.get('active_only', 'true').lower() == 'true'
                limit = int(params.get('limit', 100))
                offset = int(params.get('offset', 0))
                
                query = "SELECT * FROM newsletter_subscriptions"
                query_params = []
                
                if active_only:
                    query += " WHERE is_active = TRUE"
                
                query += " ORDER BY subscribed_at DESC LIMIT %s OFFSET %s"
                query_params.extend([limit, offset])
                
                cur.execute(query, query_params)
                subscribers = cur.fetchall()
                
                # Получаем общее количество
                count_query = "SELECT COUNT(*) as total FROM newsletter_subscriptions"
                if active_only:
                    count_query += " WHERE is_active = TRUE"
                cur.execute(count_query)
                total = cur.fetchone()['total']
                
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'subscribers': [dict(s) for s in subscribers],
                        'total': total,
                        'limit': limit,
                        'offset': offset
                    }, default=str),
                    'isBase64Encoded': False
                }
        
        # ========== BANK STATEMENTS ROUTES ==========
        if '/bank-statements' in path:
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                account_number = body_data.get('account_number', '')
                bank_name = body_data.get('bank_name')
                period_start = body_data.get('period_start')
                period_end = body_data.get('period_end')
                opening_balance = float(body_data.get('opening_balance', 0))
                closing_balance = float(body_data.get('closing_balance', 0))
                statement_data = body_data.get('statement_data', {})
                transactions_count = int(body_data.get('transactions_count', 0))
                total_income = float(body_data.get('total_income', 0))
                total_expense = float(body_data.get('total_expense', 0))
                
                if not account_number or not period_start or not period_end:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    """INSERT INTO bank_statements 
                       (user_id, account_number, bank_name, period_start, period_end, 
                        opening_balance, closing_balance, statement_data, transactions_count,
                        total_income, total_expense)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                       RETURNING *""",
                    (user_id, account_number, bank_name, period_start, period_end,
                     opening_balance, closing_balance, json.dumps(statement_data),
                     transactions_count, total_income, total_expense)
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(result), default=str),
                    'isBase64Encoded': False
                }
            
            if method == 'GET':
                # Получаем все выписки пользователя (не удаленные)
                cur.execute(
                    """SELECT * FROM bank_statements 
                       WHERE user_id = %s AND deleted_at IS NULL
                       ORDER BY created_at DESC""",
                    (user_id,)
                )
                statements = cur.fetchall()
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(s) for s in statements], default=str),
                    'isBase64Encoded': False
                }
            
            if method == 'DELETE':
                statement_id = query_dict.get('id')
                if not statement_id:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Statement ID is required'}),
                        'isBase64Encoded': False
                    }
                
                # Soft delete - устанавливаем deleted_at
                cur.execute(
                    """UPDATE bank_statements 
                       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s AND user_id = %s AND deleted_at IS NULL
                       RETURNING *""",
                    (statement_id, user_id)
                )
                result = cur.fetchone()
                if not result:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Statement not found'}),
                        'isBase64Encoded': False
                    }
                conn.commit()
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(dict(result), default=str),
                    'isBase64Encoded': False
                }
        
        # ========== AI USAGE ROUTES ==========
        if '/ai-usage' in path:
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                cur.execute(
                    """INSERT INTO ai_usage (user_id, model, tokens_used, cost, source)
                       VALUES (%s, %s, %s, %s, %s) RETURNING *""",
                    (user_id, body_data.get('model', 'gpt4'), body_data.get('tokens_used', 0),
                     body_data.get('cost', 0), body_data.get('source', 'other'))
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if '/monthly' in path and method == 'GET':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'}), 'isBase64Encoded': False}
                
                cur.execute("SELECT * FROM get_monthly_ai_usage(%s)", (user_id,))
                result = cur.fetchone()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
        
        # ========== AI SETTINGS ROUTES ==========
        if '/ai-settings' in path:
            if method == 'GET':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'}), 'isBase64Encoded': False}
                
                cur.execute("SELECT * FROM user_ai_settings WHERE user_id = %s", (user_id,))
                result = cur.fetchone()
                if not result:
                    # Создаем настройки по умолчанию
                    cur.execute(
                        "INSERT INTO user_ai_settings (user_id, preferred_model) VALUES (%s, 'gpt4') RETURNING *",
                        (user_id,)
                    )
                    result = cur.fetchone()
                    conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'PUT':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'}), 'isBase64Encoded': False}
                
                body_data = json.loads(event.get('body', '{}'))
                preferred_model = body_data.get('preferred_model', 'gpt4')
                
                cur.execute(
                    """INSERT INTO user_ai_settings (user_id, preferred_model, updated_at)
                       VALUES (%s, %s, CURRENT_TIMESTAMP)
                       ON CONFLICT (user_id) DO UPDATE SET preferred_model = %s, updated_at = CURRENT_TIMESTAMP
                       RETURNING *""",
                    (user_id, preferred_model, preferred_model)
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
        
        # ========== PROFILE ROUTES ==========
        if '/profile' in path:
            if method == 'GET':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'}), 'isBase64Encoded': False}
                
                cur.execute(
                    "SELECT id, full_name, email, phone, company, about, profile_photo_url FROM users WHERE id = %s",
                    (user_id,)
                )
                result = cur.fetchone()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'PUT':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'}), 'isBase64Encoded': False}
                
                body_data = json.loads(event.get('body', '{}'))
                update_fields = []
                values = []
                
                if 'full_name' in body_data:
                    update_fields.append('full_name = %s')
                    values.append(body_data['full_name'])
                if 'email' in body_data:
                    update_fields.append('email = %s')
                    values.append(body_data['email'])
                if 'phone' in body_data:
                    update_fields.append('phone = %s')
                    values.append(body_data['phone'])
                if 'company' in body_data:
                    update_fields.append('company = %s')
                    values.append(body_data['company'])
                if 'about' in body_data:
                    update_fields.append('about = %s')
                    values.append(body_data['about'])
                if 'profile_photo_url' in body_data:
                    update_fields.append('profile_photo_url = %s')
                    values.append(body_data['profile_photo_url'])
                
                if not update_fields:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'No fields to update'}), 'isBase64Encoded': False}
                
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                values.append(user_id)
                
                cur.execute(
                    f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s RETURNING *",
                    values
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
        
        # ========== FILE UPLOAD ROUTES ==========
        if '/files/upload' in path and method == 'POST':
            if not user_id:
                if conn:
                    cur.close()
                    conn.close()
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Unauthorized'}), 'isBase64Encoded': False}
            
            # Проверяем подключение к БД
            if not conn:
                return {
                    'statusCode': 503,
                    'headers': headers,
                    'body': json.dumps({'error': 'Database connection error'}),
                    'isBase64Encoded': False
                }
            
            # Обработка multipart/form-data или JSON
            content_type = event.get('headers', {}).get('Content-Type', '') or event.get('headers', {}).get('content-type', '')
            
            file_name = ''
            file_type = ''
            file_size = 0
            
            if 'multipart/form-data' in content_type:
                # Парсим multipart/form-data
                body_str = event.get('body', '')
                file_data = None
                try:
                    # Если body содержит JSON с multipart флагом (от server.py)
                    body_data = json.loads(body_str) if body_str else {}
                    if body_data.get('multipart'):
                        # Декодируем base64 и парсим multipart
                        import base64
                        multipart_data = base64.b64decode(body_data['data'])
                        # Получаем Content-Type из body_data или из headers
                        actual_content_type = body_data.get('content_type', content_type)
                        
                        # Ищем boundary из Content-Type
                        boundary = None
                        if 'boundary=' in actual_content_type:
                            boundary = actual_content_type.split('boundary=')[1].strip()
                        
                        if boundary:
                            # Парсим multipart данные
                            parts = multipart_data.split(f'--{boundary}'.encode())
                            for part in parts:
                                if b'Content-Disposition' in part:
                                    # Извлекаем имя файла
                                    if b'filename=' in part:
                                        filename_line = part.split(b'\r\n')[0]
                                        if b'filename=' in filename_line:
                                            filename_part = filename_line.split(b'filename=')[1]
                                            # Убираем кавычки и пробелы
                                            file_name = filename_part.decode('utf-8', errors='ignore').strip('"').strip("'").strip()
                                    # Извлекаем тип файла
                                    if b'Content-Type:' in part:
                                        content_type_line = [l for l in part.split(b'\r\n') if b'Content-Type:' in l]
                                        if content_type_line:
                                            content_type_part = content_type_line[0].split(b'Content-Type:')[1]
                                            file_type = content_type_part.decode('utf-8', errors='ignore').strip()
                                    # Извлекаем данные файла (после пустой строки)
                                    if b'\r\n\r\n' in part:
                                        file_data = part.split(b'\r\n\r\n', 1)[1]
                                        # Удаляем последний boundary и лишние символы
                                        if file_data.endswith(b'--\r\n'):
                                            file_data = file_data[:-4]
                                        elif file_data.endswith(b'--'):
                                            file_data = file_data[:-2]
                                        # Убираем trailing \r\n
                                        file_data = file_data.rstrip(b'\r\n')
                                        file_size = len(file_data)
                    else:
                        # Обычный JSON
                        file_data = body_data.get('file_data', '')
                        file_name = body_data.get('file_name', '')
                        file_type = body_data.get('file_type', '')
                        file_size = body_data.get('file_size', 0)
                except Exception as e:
                    print(f"Error parsing multipart: {e}")
                    import traceback
                    print(traceback.format_exc())
                    # Если парсинг не удался, пробуем как обычный JSON
                    try:
                        body_data = json.loads(body_str) if body_str else {}
                        file_name = body_data.get('file_name', '')
                        file_type = body_data.get('file_type', '')
                        file_size = body_data.get('file_size', 0)
                        # Пробуем получить file_data из body_data если есть
                        if 'file_data' in body_data:
                            import base64
                            try:
                                file_data = base64.b64decode(body_data['file_data'])
                                file_size = len(file_data)
                            except:
                                file_data = None
                    except Exception as json_error:
                        print(f"Error parsing JSON: {json_error}")
                        file_name = f'file_{int(datetime.now().timestamp())}'
                        file_data = None
            else:
                # JSON формат
                body_data = json.loads(event.get('body', '{}'))
                file_name = body_data.get('file_name', '')
                file_type = body_data.get('file_type', '')
                file_size = body_data.get('file_size', 0)
            
            file_type_param = body_data.get('type', 'other') if 'body_data' in locals() else 'other'
            
            # Генерируем URL (в production это будет реальный URL от storage)
            if not file_name:
                file_name = f'file_{int(datetime.now().timestamp())}'
            
            # Если file_data не был извлечен из multipart, пробуем получить из body_data
            if file_data is None and 'body_data' in locals():
                # Если это base64 строка
                if isinstance(body_data.get('file_data'), str):
                    import base64
                    try:
                        file_data = base64.b64decode(body_data['file_data'])
                        file_size = len(file_data)
                    except:
                        pass
            
            # Если все еще нет данных файла, возвращаем ошибку
            if file_data is None:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'File data is required'}),
                    'isBase64Encoded': False
                }
            
            file_url = f'/uploads/{user_id}/{file_name}_{int(datetime.now().timestamp())}'
            
            # Сохраняем файл в БД (используем BYTEA для хранения бинарных данных)
            cur.execute(
                """INSERT INTO file_storage (user_id, file_name, file_type, file_size, file_url, file_data, storage_type)
                   VALUES (%s, %s, %s, %s, %s, %s, 'local') RETURNING *""",
                (user_id, file_name, file_type, file_size, file_url, psycopg2.Binary(file_data))
            )
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps({'url': file_url, 'id': result['id']}, default=str), 'isBase64Encoded': False}
        
        # ========== MARKETPLACE ENHANCED ROUTES ==========
        if request_type == 'marketplace' or '/marketplace' in path:
            if '/purchases' in path and method == 'GET':
                params = event.get('queryStringParameters') or {}
                buyer_id = params.get('buyer_id')
                if buyer_id:
                    cur.execute(
                        """SELECT mp.*, mi.title, mi.preview_image 
                           FROM marketplace_purchases mp
                           JOIN marketplace_items mi ON mp.item_id = mi.id
                           WHERE mp.buyer_id = %s
                           ORDER BY mp.purchased_at DESC""",
                        (buyer_id,)
                    )
                    purchases = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(p) for p in purchases], default=str), 'isBase64Encoded': False}
            
            if '/earnings' in path and method == 'GET':
                params = event.get('queryStringParameters') or {}
                seller_id = params.get('seller_id')
                if seller_id:
                    cur.execute(
                        """SELECT COALESCE(SUM(mp.price * 0.7), 0) as total
                           FROM marketplace_purchases mp
                           JOIN marketplace_items mi ON mp.item_id = mi.id
                           WHERE mi.seller_id = %s AND mp.status IN ('delivered', 'completed')""",
                        (seller_id,)
                    )
                    result = cur.fetchone()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'POST':
                # Обработка multipart/form-data или JSON
                content_type = event.get('headers', {}).get('Content-Type', '') or event.get('headers', {}).get('content-type', '')
                body_data = {}
                
                if 'multipart/form-data' in content_type:
                    body_str = event.get('body', '')
                    try:
                        body_data = json.loads(body_str) if body_str else {}
                    except:
                        body_data = {}
                else:
                    body_data = json.loads(event.get('body', '{}'))
                
                # Извлекаем данные о файлах и автовыдаче
                cover_image_url = body_data.get('cover_image_url')
                gallery_images = body_data.get('gallery_images', [])
                if isinstance(gallery_images, str):
                    try:
                        gallery_images = json.loads(gallery_images)
                    except:
                        gallery_images = []
                delivery_type = body_data.get('delivery_type', 'manual')
                auto_delivery_content = body_data.get('auto_delivery_content')
                attached_file_url = body_data.get('attached_file_url')
                attached_file_name = body_data.get('attached_file_name')
                
                # Обновляем создание товара для поддержки новых полей
                cur.execute(
                    """INSERT INTO marketplace_items 
                       (seller_id, title, description, category, item_type, item_subtype, price, 
                        domain_name, hosting_expires_at, screenshots, moderation_status,
                        cover_image_url, gallery_images, delivery_type, auto_delivery_content,
                        attached_file_url, attached_file_name)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending',
                               %s, %s, %s, %s, %s, %s) RETURNING *""",
                    (body_data.get('seller_id'), body_data.get('title'), body_data.get('description'),
                     body_data.get('category'), body_data.get('item_type'), body_data.get('item_subtype'),
                     body_data.get('price'), body_data.get('domain_name'), body_data.get('hosting_expires_at'),
                     json.dumps(body_data.get('screenshots', [])),
                     cover_image_url, json.dumps(gallery_images), delivery_type, auto_delivery_content,
                     attached_file_url, attached_file_name)
                )
                result = cur.fetchone()
                
                # Если товар с автовыдачей, создаем записи для автовыдачи
                if delivery_type in ('auto', 'repeatable'):
                    # Для repeatable создаем одну запись (может быть только файл или только контент, или оба)
                    if delivery_type == 'repeatable':
                        # Один товар для всех покупателей
                        cur.execute(
                            """INSERT INTO marketplace_auto_delivery_items 
                               (item_id, content, file_url, file_name)
                               VALUES (%s, %s, %s, %s) RETURNING *""",
                            (result['id'], auto_delivery_content or '', attached_file_url, attached_file_name)
                        )
                    else:
                        # Автовыдача - создаем записи из контента (если есть) или одну запись с файлом
                        if auto_delivery_content:
                            # Если контент - это многострочный текст (каждый ключ на новой строке)
                            keys = [k.strip() for k in auto_delivery_content.split('\n') if k.strip()]
                            if keys:
                                for key in keys:
                                    cur.execute(
                                        """INSERT INTO marketplace_auto_delivery_items 
                                           (item_id, content, file_url, file_name)
                                           VALUES (%s, %s, %s, %s)""",
                                        (result['id'], key, attached_file_url, attached_file_name)
                                    )
                            else:
                                # Если контент пустой, но есть файл - создаем одну запись с файлом
                                if attached_file_url:
                                    cur.execute(
                                        """INSERT INTO marketplace_auto_delivery_items 
                                           (item_id, content, file_url, file_name)
                                           VALUES (%s, %s, %s, %s)""",
                                        (result['id'], '', attached_file_url, attached_file_name)
                                    )
                        elif attached_file_url:
                            # Если нет контента, но есть файл - создаем одну запись с файлом
                            cur.execute(
                                """INSERT INTO marketplace_auto_delivery_items 
                                   (item_id, content, file_url, file_name)
                                   VALUES (%s, %s, %s, %s)""",
                                (result['id'], '', attached_file_url, attached_file_name)
                            )
                
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                seller_id = params.get('seller_id')
                if seller_id:
                    cur.execute(
                        "SELECT * FROM marketplace_items WHERE seller_id = %s ORDER BY created_at DESC",
                        (seller_id,)
                    )
                    items = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(i) for i in items], default=str), 'isBase64Encoded': False}
        
        # ========== EXCHANGE ROUTES ==========
        params = event.get('queryStringParameters') or {}
        exchange_type = params.get('type') == 'exchange'
        exchange_path = params.get('path', '')
        
        # Check if this is an exchange request
        if '/exchange' in path or exchange_type:
            if '/services' in path or exchange_path == '/services':
                if method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    cur.execute(
                        """INSERT INTO exchange_services (freelancer_id, title, description, category, price)
                           VALUES (%s, %s, %s, %s, %s) RETURNING *""",
                        (body_data['freelancer_id'], body_data['title'], body_data['description'], 
                         body_data['category'], body_data['price'])
                    )
                    result = cur.fetchone()
                    conn.commit()
                    cur.close()
                    conn.close()
                    return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
                
                if method == 'GET':
                    params = event.get('queryStringParameters') or {}
                    freelancer_id = params.get('freelancer_id')
                    category = params.get('category')
                    query = "SELECT * FROM exchange_services WHERE is_active = TRUE"
                    query_params = []
                    if freelancer_id:
                        query += " AND freelancer_id = %s"
                        query_params.append(freelancer_id)
                    if category:
                        query += " AND category = %s"
                        query_params.append(category)
                    query += " ORDER BY created_at DESC LIMIT 50"
                    cur.execute(query, query_params)
                    services = cur.fetchall()
                    cur.close()
                    conn.close()
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(s) for s in services], default=str), 'isBase64Encoded': False}
            
            if '/proposals' in path or exchange_path == '/proposals':
                if method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    order_id = body_data['order_id']
                    freelancer_id = body_data['freelancer_id']
                    
                    # Проверяем ограничение на количество откликов
                    cur.execute("SELECT max_proposals, client_id FROM exchange_orders WHERE id = %s", (order_id,))
                    order = cur.fetchone()
                    if not order:
                        cur.close()
                        conn.close()
                        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Order not found'}), 'isBase64Encoded': False}
                    
                    # Проверяем, не превышен ли лимит откликов
                    if order['max_proposals'] is not None:
                        cur.execute("SELECT COUNT(*) as count FROM exchange_proposals WHERE order_id = %s AND status != 'withdrawn'", (order_id,))
                        proposals_count = cur.fetchone()['count']
                        if proposals_count >= order['max_proposals']:
                            cur.close()
                            conn.close()
                            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Maximum number of proposals reached'}), 'isBase64Encoded': False}
                    
                    # Проверяем, не откликался ли уже этот фрилансер
                    cur.execute("SELECT id FROM exchange_proposals WHERE order_id = %s AND freelancer_id = %s AND status != 'withdrawn'", (order_id, freelancer_id))
                    existing = cur.fetchone()
                    if existing:
                        cur.close()
                        conn.close()
                        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'You have already submitted a proposal for this order'}), 'isBase64Encoded': False}
                    
                    cur.execute(
                        """INSERT INTO exchange_proposals (order_id, freelancer_id, price, message, delivery_time_days)
                           VALUES (%s, %s, %s, %s, %s) RETURNING *""",
                        (order_id, freelancer_id, body_data['price'], body_data['message'], body_data.get('delivery_time_days'))
                    )
                    result = cur.fetchone()
                    conn.commit()
                    cur.close()
                    conn.close()
                    return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
                
                if method == 'GET':
                    params = event.get('queryStringParameters') or {}
                    order_id = params.get('order_id')
                    freelancer_id = params.get('freelancer_id')
                    
                    if order_id:
                        # Получаем отклики с информацией о фрилансерах
                        cur.execute("""
                            SELECT p.*, 
                                   u.full_name as freelancer_name,
                                   u.email as freelancer_email,
                                   u.avatar as freelancer_avatar,
                                   (SELECT AVG(rating)::DECIMAL(3,2) FROM exchange_reviews r 
                                    JOIN exchange_deals d ON r.deal_id = d.id 
                                    WHERE d.freelancer_id = p.freelancer_id) as freelancer_rating,
                                   (SELECT COUNT(*) FROM exchange_deals WHERE freelancer_id = p.freelancer_id AND status = 'completed') as completed_deals
                            FROM exchange_proposals p
                            LEFT JOIN users u ON p.freelancer_id = u.id
                            WHERE p.order_id = %s AND p.status != 'withdrawn'
                            ORDER BY p.created_at DESC
                        """, (order_id,))
                        proposals = cur.fetchall()
                        cur.close()
                        conn.close()
                        return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(p) for p in proposals], default=str), 'isBase64Encoded': False}
                    
                    if freelancer_id:
                        cur.execute("SELECT * FROM exchange_proposals WHERE freelancer_id = %s ORDER BY created_at DESC", (freelancer_id,))
                        proposals = cur.fetchall()
                        cur.close()
                        conn.close()
                        return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(p) for p in proposals], default=str), 'isBase64Encoded': False}
            
            if method == 'PUT':
                body_data = json.loads(event.get('body', '{}'))
                order_id = body_data.get('order_id') or body_data.get('id')
                
                if not order_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'order_id required'}), 'isBase64Encoded': False}
                
                # Проверяем, существует ли заказ и принадлежит ли он пользователю
                cur.execute("SELECT client_id, status FROM exchange_orders WHERE id = %s", (order_id,))
                existing_order = cur.fetchone()
                
                if not existing_order:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Order not found'}), 'isBase64Encoded': False}
                
                # Проверяем права доступа (только владелец может редактировать)
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
                
                if existing_order['client_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
                
                # Нельзя редактировать заказы в работе или завершенные
                if existing_order['status'] in ('in_progress', 'completed'):
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Cannot edit order in progress or completed'}), 'isBase64Encoded': False}
                
                # Обновляем только переданные поля
                update_fields = []
                update_values = []
                
                if 'title' in body_data:
                    update_fields.append("title = %s")
                    update_values.append(body_data['title'])
                if 'description' in body_data:
                    update_fields.append("description = %s")
                    update_values.append(body_data['description'])
                if 'category' in body_data:
                    update_fields.append("category = %s")
                    update_values.append(body_data['category'])
                if 'budget_min' in body_data:
                    update_fields.append("budget_min = %s")
                    update_values.append(body_data.get('budget_min'))
                if 'budget_max' in body_data:
                    update_fields.append("budget_max = %s")
                    update_values.append(body_data.get('budget_max'))
                if 'deadline' in body_data:
                    update_fields.append("deadline = %s")
                    update_values.append(body_data.get('deadline'))
                if 'required_skills' in body_data:
                    update_fields.append("required_skills = %s")
                    update_values.append(json.dumps(body_data['required_skills']) if isinstance(body_data['required_skills'], list) else body_data['required_skills'])
                if 'cover_image_url' in body_data:
                    update_fields.append("cover_image_url = %s")
                    update_values.append(body_data['cover_image_url'])
                if 'attachments' in body_data:
                    attachments = body_data['attachments'] if isinstance(body_data['attachments'], list) else []
                    update_fields.append("attachments = %s")
                    update_values.append(json.dumps(attachments))
                if 'status' in body_data:
                    update_fields.append("status = %s")
                    update_values.append(body_data['status'])
                
                if not update_fields:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'No fields to update'}), 'isBase64Encoded': False}
                
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                update_values.append(order_id)
                
                query = f"UPDATE exchange_orders SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
                cur.execute(query, update_values)
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'DELETE':
                params = event.get('queryStringParameters') or {}
                order_id = params.get('order_id')
                
                if not order_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'order_id required'}), 'isBase64Encoded': False}
                
                # Проверяем, существует ли заказ и принадлежит ли он пользователю
                cur.execute("SELECT client_id, status FROM exchange_orders WHERE id = %s", (order_id,))
                existing_order = cur.fetchone()
                
                if not existing_order:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Order not found'}), 'isBase64Encoded': False}
                
                # Проверяем права доступа (только владелец может удалить)
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
                
                if existing_order['client_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
                
                # Нельзя удалять заказы в работе или завершенные (только отменить)
                if existing_order['status'] in ('in_progress', 'completed'):
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Cannot delete order in progress or completed. Use cancel instead.'}), 'isBase64Encoded': False}
                
                # Удаляем заказ (или помечаем как отмененный)
                cur.execute("UPDATE exchange_orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *", (order_id,))
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True, 'message': 'Order cancelled', 'order': dict(result)}, default=str), 'isBase64Encoded': False}
            
            if method == 'POST':
                # Обработка multipart/form-data или JSON
                content_type = event.get('headers', {}).get('Content-Type', '') or event.get('headers', {}).get('content-type', '')
                body_data = {}
                attachments = []
                cover_image_url = None
                
                if 'multipart/form-data' in content_type:
                    # Парсим multipart/form-data
                    body_str = event.get('body', '')
                    # Простой парсер multipart (для production лучше использовать библиотеку)
                    # Здесь упрощенная версия - ожидаем что файлы уже загружены через /api/files/upload
                    # и передаются только URL
                    try:
                        body_data = json.loads(body_str) if body_str else {}
                    except:
                        # Если не JSON, пытаемся извлечь данные из multipart
                        body_data = {}
                else:
                    body_data = json.loads(event.get('body', '{}'))
                
                # Извлекаем данные о файлах (если переданы URL после загрузки)
                if 'cover_image_url' in body_data:
                    cover_image_url = body_data['cover_image_url']
                if 'attachments' in body_data:
                    attachments = body_data['attachments'] if isinstance(body_data['attachments'], list) else []
                
                required_skills = body_data.get('required_skills', [])
                if isinstance(required_skills, list):
                    required_skills_json = json.dumps(required_skills)
                else:
                    required_skills_json = required_skills
                
                attachments_json = json.dumps(attachments) if attachments else '[]'
                
                # Получаем рейтинг заказчика
                cur.execute("SELECT rating FROM users WHERE id = %s", (body_data['client_id'],))
                client_user = cur.fetchone()
                client_rating = client_user['rating'] if client_user and client_user.get('rating') else 0.0
                
                cur.execute(
                    """INSERT INTO exchange_orders 
                       (client_id, title, description, category, budget_min, budget_max, deadline, 
                        required_skills, max_proposals, client_rating, cover_image_url, attachments)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *""",
                    (body_data['client_id'], body_data['title'], body_data['description'], 
                     body_data['category'], body_data.get('budget_min'), body_data.get('budget_max'),
                     body_data.get('deadline'), required_skills_json, 
                     body_data.get('max_proposals'), client_rating,
                     cover_image_url, attachments_json)
                )
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                order_id = params.get('order_id')
                status = params.get('status', 'open')
                
                if order_id:
                    # Регистрируем просмотр заказа
                    if user_id:
                        try:
                            ip_address = event.get('headers', {}).get('X-Forwarded-For', '').split(',')[0].strip() or '127.0.0.1'
                            cur.execute("""
                                INSERT INTO exchange_order_views (order_id, user_id, ip_address)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (order_id, user_id, ip_address) DO NOTHING
                            """, (order_id, user_id, ip_address))
                            conn.commit()
                        except Exception:
                            pass
                    
                    cur.execute("""
                        SELECT o.*, 
                               COUNT(DISTINCT p.id) as proposals_count,
                               u.rating as client_rating
                        FROM exchange_orders o
                        LEFT JOIN exchange_proposals p ON o.id = p.order_id AND p.status != 'withdrawn'
                        LEFT JOIN users u ON o.client_id = u.id
                        WHERE o.id = %s
                        GROUP BY o.id, u.rating
                    """, (order_id,))
                    order = cur.fetchone()
                    if order:
                        # Правильно обрабатываем JSONB поля
                        order_dict = dict(order)
                        if isinstance(order_dict.get('attachments'), str):
                            try:
                                order_dict['attachments'] = json.loads(order_dict['attachments'])
                            except:
                                order_dict['attachments'] = []
                        if isinstance(order_dict.get('required_skills'), str):
                            try:
                                order_dict['required_skills'] = json.loads(order_dict['required_skills'])
                            except:
                                order_dict['required_skills'] = []
                    cur.close()
                    conn.close()
                    return {'statusCode': 200 if order else 404, 'headers': headers, 
                           'body': json.dumps(order_dict if order else {'error': 'Not found'}, default=str), 'isBase64Encoded': False}
                
                # Получаем заказы с подсчетом откликов и рейтингом заказчика
                cur.execute("""
                    SELECT o.*, 
                           COUNT(DISTINCT p.id) as proposals_count,
                           u.rating as client_rating
                    FROM exchange_orders o
                    LEFT JOIN exchange_proposals p ON o.id = p.order_id AND p.status != 'withdrawn'
                    LEFT JOIN users u ON o.client_id = u.id
                    WHERE o.status = %s
                    GROUP BY o.id, u.rating
                    ORDER BY o.created_at DESC 
                    LIMIT 50
                """, (status,))
                orders = cur.fetchall()
                
                # Регистрируем просмотр заказов, если пользователь авторизован
                if user_id:
                    ip_address = event.get('headers', {}).get('X-Forwarded-For', '').split(',')[0].strip() or '127.0.0.1'
                    for order in orders:
                        try:
                            cur.execute("""
                                INSERT INTO exchange_order_views (order_id, user_id, ip_address)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (order_id, user_id, ip_address) DO NOTHING
                            """, (order['id'], user_id, ip_address))
                        except Exception:
                            pass  # Игнорируем ошибки при вставке просмотров
                    conn.commit()
                
                # Правильно обрабатываем JSONB поля для всех заказов
                orders_list = []
                for order in orders:
                    order_dict = dict(order)
                    if isinstance(order_dict.get('attachments'), str):
                        try:
                            order_dict['attachments'] = json.loads(order_dict['attachments'])
                        except:
                            order_dict['attachments'] = []
                    if isinstance(order_dict.get('required_skills'), str):
                        try:
                            order_dict['required_skills'] = json.loads(order_dict['required_skills'])
                        except:
                            order_dict['required_skills'] = []
                    orders_list.append(order_dict)
                
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps(orders_list, default=str), 'isBase64Encoded': False}
            
            # Обработка дополнительных действий через action параметр
            action = params.get('action')
            
            # GET /api/blocks?type=exchange&action=deal_messages&deal_id=X - сообщения сделки
            if action == 'deal_messages' and method == 'GET':
                deal_id = params.get('deal_id')
                if not deal_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'deal_id required'}), 'isBase64Encoded': False}
                
                # Проверяем права доступа
                cur.execute("SELECT client_id, freelancer_id FROM exchange_deals WHERE id = %s", (deal_id,))
                deal = cur.fetchone()
                if not deal:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Deal not found'}), 'isBase64Encoded': False}
                
                if user_id and deal['client_id'] != user_id and deal['freelancer_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
                
                cur.execute("SELECT * FROM exchange_deal_messages WHERE deal_id = %s ORDER BY created_at ASC", (deal_id,))
                messages = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(m) for m in messages], default=str), 'isBase64Encoded': False}
            
            # POST /api/blocks?type=exchange&action=deal_messages - отправить сообщение в сделку
            if action == 'deal_messages' and method == 'POST':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
                
                body_data = json.loads(event.get('body', '{}'))
                deal_id = body_data.get('deal_id')
                message = body_data.get('message')
                is_problem = body_data.get('is_problem', False)
                
                if not deal_id or not message:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'deal_id and message required'}), 'isBase64Encoded': False}
                
                # Проверяем права доступа
                cur.execute("SELECT client_id, freelancer_id FROM exchange_deals WHERE id = %s", (deal_id,))
                deal = cur.fetchone()
                if not deal:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Deal not found'}), 'isBase64Encoded': False}
                
                if deal['client_id'] != user_id and deal['freelancer_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
                
                # Если это сообщение о проблеме, добавляем системное сообщение
                if is_problem:
                    problem_message = f"Пользователь сообщил о проблеме: {message}"
                    cur.execute("""
                        INSERT INTO exchange_deal_messages (deal_id, user_id, message, is_system)
                        VALUES (%s, %s, %s, TRUE)
                    """, (deal_id, user_id, problem_message))
                
                cur.execute("""
                    INSERT INTO exchange_deal_messages (deal_id, user_id, message)
                    VALUES (%s, %s, %s)
                    RETURNING *
                """, (deal_id, user_id, message))
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            # POST /api/blocks?type=exchange&action=review - оставить отзыв
            if action == 'review' and method == 'POST':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
                
                body_data = json.loads(event.get('body', '{}'))
                deal_id = body_data.get('deal_id')
                reviewee_id = body_data.get('reviewee_id')
                rating = body_data.get('rating')
                comment = body_data.get('comment', '')
                
                if not deal_id or not reviewee_id or not rating:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'deal_id, reviewee_id and rating required'}), 'isBase64Encoded': False}
                
                # Проверяем, что сделка завершена
                cur.execute("SELECT status, client_id, freelancer_id FROM exchange_deals WHERE id = %s", (deal_id,))
                deal = cur.fetchone()
                if not deal:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Deal not found'}), 'isBase64Encoded': False}
                
                if deal['status'] != 'completed':
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Can only review completed deals'}), 'isBase64Encoded': False}
                
                # Проверяем, что пользователь является участником сделки
                if deal['client_id'] != user_id and deal['freelancer_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied'}), 'isBase64Encoded': False}
                
                # Проверяем, не оставлял ли уже отзыв
                cur.execute("SELECT id FROM exchange_reviews WHERE deal_id = %s AND reviewer_id = %s", (deal_id, user_id))
                existing = cur.fetchone()
                if existing:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Review already submitted'}), 'isBase64Encoded': False}
                
                cur.execute("""
                    INSERT INTO exchange_reviews (deal_id, reviewer_id, reviewee_id, rating, comment)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *
                """, (deal_id, user_id, reviewee_id, rating, comment))
                result = cur.fetchone()
                
                # Обновляем рейтинг пользователя
                cur.execute("""
                    UPDATE users SET rating = (
                        SELECT AVG(r.rating)::DECIMAL(3,2)
                        FROM exchange_reviews r
                        JOIN exchange_deals d ON r.deal_id = d.id
                        WHERE (d.client_id = %s AND r.reviewee_id = d.client_id) 
                           OR (d.freelancer_id = %s AND r.reviewee_id = d.freelancer_id)
                    )
                    WHERE id = %s
                """, (reviewee_id, reviewee_id, reviewee_id))
                
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(result), default=str), 'isBase64Encoded': False}
            
            # GET /api/blocks?type=exchange&action=portfolio&freelancer_id=X - портфолио фрилансера
            if action == 'portfolio' and method == 'GET':
                freelancer_id = params.get('freelancer_id')
                if not freelancer_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'freelancer_id required'}), 'isBase64Encoded': False}
                
                cur.execute("SELECT * FROM exchange_portfolio WHERE freelancer_id = %s ORDER BY created_at DESC", (freelancer_id,))
                portfolio = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(p) for p in portfolio], default=str), 'isBase64Encoded': False}
            
            # GET /api/blocks?type=exchange&action=reviews&freelancer_id=X - отзывы фрилансера
            if action == 'reviews' and method == 'GET':
                freelancer_id = params.get('freelancer_id')
                if not freelancer_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'freelancer_id required'}), 'isBase64Encoded': False}
                
                cur.execute("""
                    SELECT r.*, u.full_name as reviewer_name
                    FROM exchange_reviews r
                    JOIN exchange_deals d ON r.deal_id = d.id
                    LEFT JOIN users u ON r.reviewer_id = u.id
                    WHERE d.freelancer_id = %s OR (d.client_id = %s AND r.reviewee_id = %s)
                    ORDER BY r.created_at DESC
                """, (freelancer_id, freelancer_id, freelancer_id))
                reviews = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(r) for r in reviews], default=str), 'isBase64Encoded': False}
            
            # GET /api/blocks?type=exchange&action=skills&freelancer_id=X - навыки фрилансера
            if action == 'skills' and method == 'GET':
                freelancer_id = params.get('freelancer_id')
                if not freelancer_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'freelancer_id required'}), 'isBase64Encoded': False}
                
                cur.execute("SELECT skill_name, proficiency_level FROM exchange_freelancer_skills WHERE freelancer_id = %s ORDER BY proficiency_level DESC", (freelancer_id,))
                skills = cur.fetchall()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([dict(s) for s in skills], default=str), 'isBase64Encoded': False}
            
            # POST /api/blocks?type=exchange&action=accept_proposal - принять отклик и создать сделку
            if action == 'accept_proposal' and method == 'POST':
                if not user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Authentication required'}), 'isBase64Encoded': False}
                
                body_data = json.loads(event.get('body', '{}'))
                proposal_id = body_data.get('proposal_id')
                order_id = body_data.get('order_id')
                
                if not proposal_id or not order_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'proposal_id and order_id required'}), 'isBase64Encoded': False}
                
                # Проверяем права доступа (только заказчик может принять отклик)
                cur.execute("SELECT client_id, status FROM exchange_orders WHERE id = %s", (order_id,))
                order = cur.fetchone()
                if not order:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Order not found'}), 'isBase64Encoded': False}
                
                if order['client_id'] != user_id:
                    cur.close()
                    conn.close()
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Only order owner can accept proposals'}), 'isBase64Encoded': False}
                
                if order['status'] != 'open':
                    cur.close()
                    conn.close()
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Can only accept proposals for open orders'}), 'isBase64Encoded': False}
                
                # Получаем информацию об отклике
                cur.execute("SELECT freelancer_id, price, currency FROM exchange_proposals WHERE id = %s AND order_id = %s", (proposal_id, order_id))
                proposal = cur.fetchone()
                if not proposal:
                    cur.close()
                    conn.close()
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Proposal not found'}), 'isBase64Encoded': False}
                
                # Создаем сделку
                cur.execute("""
                    INSERT INTO exchange_deals (order_id, proposal_id, client_id, freelancer_id, amount, currency, status, escrow_status)
                    VALUES (%s, %s, %s, %s, %s, %s, 'in_progress', 'holding')
                    RETURNING *
                """, (order_id, proposal_id, user_id, proposal['freelancer_id'], proposal['price'], proposal['currency']))
                deal = cur.fetchone()
                
                # Обновляем статус отклика
                cur.execute("UPDATE exchange_proposals SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = %s", (proposal_id,))
                
                # Отклоняем остальные отклики на этот заказ
                cur.execute("UPDATE exchange_proposals SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE order_id = %s AND id != %s AND status = 'pending'", (order_id, proposal_id))
                
                # Обновляем статус заказа
                cur.execute("UPDATE exchange_orders SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = %s", (order_id,))
                
                # Создаем системное сообщение в чате сделки
                cur.execute("""
                    INSERT INTO exchange_deal_messages (deal_id, user_id, message, is_system)
                    VALUES (%s, %s, %s, TRUE)
                """, (deal['id'], user_id, f"Сделка создана. Отклик принят."))
                
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(deal), default=str), 'isBase64Encoded': False}
        
        # ========== BLOCKS ROUTES (ORIGINAL) ==========
        # Only process blocks routes if not exchange/marketplace/bots
        if '/bots' not in path and '/marketplace' not in path and not exchange_type:
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                block_data = BlockCreate(**body_data)
                
                cur.execute(
                    """INSERT INTO blocks (page_id, type, content, styles, position, parent_id) 
                       VALUES (%s, %s, %s, %s, %s, %s) 
                       RETURNING id, page_id, type, content, styles, position, parent_id""",
                    (
                        block_data.page_id,
                        block_data.type,
                        json.dumps(block_data.content),
                        json.dumps(block_data.styles),
                        block_data.position,
                        block_data.parent_id
                    )
                )
                result = cur.fetchone()
                conn.commit()
                
                cur.close()
                conn.close()
                
                result_dict = {
                    'id': result['id'],
                    'page_id': result['page_id'],
                    'type': result['type'],
                    'content': result['content'],
                    'styles': result['styles'],
                    'position': result['position'],
                    'parent_id': result['parent_id']
                }
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(result_dict),
                    'isBase64Encoded': False
                }
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            page_id = params.get('page_id')
            
            if not page_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'page_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT * FROM blocks WHERE page_id = %s ORDER BY position ASC",
                (page_id,)
            )
            blocks = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([dict(b) for b in blocks], default=str),
                'isBase64Encoded': False
            }
            
            if method == 'PUT':
                body_data = json.loads(event.get('body', '{}'))
                block_id = body_data.get('block_id')
                
                if not block_id:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'block_id required'}),
                        'isBase64Encoded': False
                    }
                
                update_data = BlockUpdate(**body_data)
                
                set_clauses = []
                values = []
                
                if update_data.content is not None:
                    set_clauses.append("content = %s")
                    values.append(json.dumps(update_data.content))
                if update_data.styles is not None:
                    set_clauses.append("styles = %s")
                    values.append(json.dumps(update_data.styles))
                if update_data.position is not None:
                    set_clauses.append("position = %s")
                    values.append(update_data.position)
                
                set_clauses.append("updated_at = CURRENT_TIMESTAMP")
                values.append(block_id)
                
                cur.execute(
                    f"UPDATE blocks SET {', '.join(set_clauses)} WHERE id = %s RETURNING *",
                    values
                )
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
        
        # If we reach here and no route matched, return 404
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Route not found'}),
            'isBase64Encoded': False
        }
    
    except (KeyError, ValueError) as db_error:
        # База данных не настроена - возвращаем пустые данные для GET запросов
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            exchange_type = params.get('type') == 'exchange'
            
            # Для exchange возвращаем пустой массив
            if '/exchange' in path or exchange_type:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([]),
                    'isBase64Encoded': False
                }
            
            # Для других GET запросов тоже пустой массив
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        else:
            # Для POST/PUT запросов возвращаем ошибку
            return {
                'statusCode': 503,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Database not configured',
                    'message': 'DATABASE_URL environment variable is not set'
                }),
                'isBase64Encoded': False
            }
    except psycopg2.Error as db_error:
        # Ошибка подключения к БД - возвращаем пустые данные для GET
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            exchange_type = params.get('type') == 'exchange'
            
            if '/exchange' in path or exchange_type:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([]),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([]),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 503,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Database connection error',
                    'message': str(db_error)
                }),
                'isBase64Encoded': False
            }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Unexpected error: {str(e)}")
        print(error_trace)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'trace': error_trace}),
            'isBase64Encoded': False
        }