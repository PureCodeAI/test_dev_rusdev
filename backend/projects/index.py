import json
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = Field(..., pattern='^(site|bot)$')
    user_id: int

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    status: Optional[str] = None
    settings: Optional[Dict] = None

class PageCreate(BaseModel):
    project_id: int
    name: str
    path: str
    is_home: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class BlockCreate(BaseModel):
    page_id: int
    type: str
    content: Dict
    styles: Dict = {}
    position: int
    parent_id: Optional[int] = None

def get_db_connection():
    # Получаем DATABASE_URL с fallback на значение по умолчанию
    dsn = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление проектами: создание, загрузка, обновление, удаление
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            project_data = ProjectCreate(**body_data)
            
            try:
                cur.execute(
                    "INSERT INTO projects (user_id, name, type) VALUES (%s, %s, %s) RETURNING id, name, type, status",
                    (project_data.user_id, project_data.name, project_data.type)
                )
                result = cur.fetchone()
                
                cur.execute(
                    "INSERT INTO pages (project_id, name, path, is_home) VALUES (%s, %s, %s, %s) RETURNING id",
                    (result['id'], 'Главная', '/', True)
                )
                page_result = cur.fetchone()
                conn.commit()
            except Exception as e:
                conn.rollback()
                cur.close()
                conn.close()
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': 'failed to create project', 'details': str(e)}),
                    'isBase64Encoded': False
                }
            
            cur.close()
            conn.close()
            
            result_dict = {
                'id': result['id'],
                'name': result['name'],
                'type': result['type'],
                'status': result['status']
            }
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({
                    'project': result_dict,
                    'page_id': page_result['id']
                }),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_id = params.get('user_id')
            project_id = params.get('project_id')
            
            if project_id:
                cur.execute(
                    "SELECT * FROM projects WHERE id = %s",
                    (project_id,)
                )
                project = cur.fetchone()
                
                if project:
                    cur.execute(
                        "SELECT * FROM pages WHERE project_id = %s ORDER BY is_home DESC, id ASC",
                        (project_id,)
                    )
                    pages = cur.fetchall()
                    
                    project_with_pages = dict(project)
                    project_with_pages['pages'] = [dict(p) for p in pages]
                    
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps(project_with_pages, default=str),
                        'isBase64Encoded': False
                    }
                else:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Project not found'}),
                        'isBase64Encoded': False
                    }
            
            elif user_id:
                cur.execute(
                    "SELECT * FROM projects WHERE user_id = %s ORDER BY updated_at DESC",
                    (user_id,)
                )
                projects = cur.fetchall()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(p) for p in projects], default=str),
                    'isBase64Encoded': False
                }
            
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id or project_id required'}),
                    'isBase64Encoded': False
                }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            project_id = body_data.get('project_id')
            
            if not project_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'project_id required'}),
                    'isBase64Encoded': False
                }
            
            update_data = ProjectUpdate(**body_data)
            
            set_clauses = []
            values = []
            
            if update_data.name:
                set_clauses.append("name = %s")
                values.append(update_data.name)
            if update_data.domain:
                set_clauses.append("domain = %s")
                values.append(update_data.domain)
            if update_data.status:
                set_clauses.append("status = %s")
                values.append(update_data.status)
            if update_data.settings is not None:
                set_clauses.append("settings = %s")
                values.append(json.dumps(update_data.settings))
            
            set_clauses.append("updated_at = CURRENT_TIMESTAMP")
            values.append(project_id)
            
            cur.execute(
                f"UPDATE projects SET {', '.join(set_clauses)} WHERE id = %s RETURNING *",
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