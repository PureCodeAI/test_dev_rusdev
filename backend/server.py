#!/usr/bin/env python3
"""
Локальный сервер для запуска бэкенд-функций
Запуск: python server.py
"""

import json
import os
import sys
import base64
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import importlib.util

# Установка DATABASE_URL напрямую в коде (для локальной разработки)
# Значение по умолчанию: порт 5433
# Это значение всегда используется, даже если есть .env файл
os.environ['DATABASE_URL'] = 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db'
print("✅ DATABASE_URL установлен напрямую в коде (порт 5433)")

# Добавляем пути к модулям
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class APIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Обработка CORS preflight запросов"""
        parsed_path = urlparse(self.path)
        # Специальная обработка для /uploads/
        if parsed_path.path.startswith('/uploads/'):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id')
            self.send_header('Access-Control-Max-Age', '86400')
            self.end_headers()
            return
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def do_GET(self):
        # Специальная обработка для раздачи файлов из /uploads/
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith('/uploads/'):
            self._serve_file(parsed_path.path)
            return
        self._handle_request('GET')
    
    def do_POST(self):
        self._handle_request('POST')
    
    def do_PUT(self):
        self._handle_request('PUT')
    
    def do_DELETE(self):
        self._handle_request('DELETE')
    
    def _handle_request(self, method):
        """Обработка HTTP запросов"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            query_params = parse_qs(parsed_path.query)
            
            # Преобразуем query params в простой dict
            query_dict = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
            
            # Определяем, какой модуль использовать
            module_name = self._get_module_name(path)
            
            if not module_name:
                self._send_response(404, {'error': 'Not found'})
                return
            
            # Загружаем модуль
            module_path = os.path.join(os.path.dirname(__file__), module_name, 'index.py')
            if not os.path.exists(module_path):
                self._send_response(404, {'error': f'Module {module_name} not found'})
                return
            
            spec = importlib.util.spec_from_file_location(module_name, module_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Читаем body для POST/PUT
            body = ''
            if method in ['POST', 'PUT']:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    raw_body = self.rfile.read(content_length)
                    content_type = self.headers.get('Content-Type', '')
                    
                    # Если это multipart/form-data, сохраняем как base64 для передачи в handler
                    if 'multipart/form-data' in content_type:
                        import base64
                        body = base64.b64encode(raw_body).decode('utf-8')
                        # Добавляем флаг что это base64
                        body = json.dumps({'multipart': True, 'data': body, 'content_type': content_type})
                    else:
                        try:
                            body = raw_body.decode('utf-8')
                        except UnicodeDecodeError:
                            # Для бинарных upload (files) пытаемся сохранить как latin1, чтобы не падать
                            body = raw_body.decode('latin1')
            
            # Формируем event для handler
            event = {
                'httpMethod': method,
                'path': path,
                'queryStringParameters': query_dict if query_dict else None,
                'body': body,
                'headers': dict(self.headers)
            }
            
            # Вызываем handler
            context = {}  # Пустой контекст для локальной разработки
            response = module.handler(event, context)
            
            # Отправляем ответ
            status_code = response.get('statusCode', 200)
            headers = response.get('headers', {})
            body = response.get('body', '{}')
            
            self.send_response(status_code)
            for key, value in headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(body.encode('utf-8'))
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            trace = traceback.format_exc()
            print(f"Error handling request: {error_msg}")
            print(trace)
            self._send_response(500, {'error': error_msg, 'trace': trace})
    
    def _get_module_name(self, path):
        """Определяет имя модуля по пути"""
        # Убираем /api из начала пути
        if path.startswith('/api/'):
            path = path[5:]
        
        # Определяем модуль по первому сегменту пути
        parts = path.split('/')
        if not parts or not parts[0]:
            # Проверяем query параметры для определения типа
            return None
        
        module_name = parts[0]
        
        # Специальная обработка для blocks (может быть bots, marketplace, exchange, ai-usage, ai-settings, profile, files/upload, bank-statements)
        if module_name in [
            'blocks',
            'bots',
            'marketplace',
            'exchange',
            'ai-usage',
            'ai-settings',
            'profile',
            'files',
            'bank-statements',
            # Прямые модули, которые должны обслуживаться из отдельных папок
            'roles',
            'permissions',
            'login',
            'register',
            'integrations',
            'projects',
            'support',
        ]:
            # permissions обслуживаются тем же модулем, что и roles
            if module_name in ['roles', 'permissions']:
                return 'roles'
            # login/register/integrations/projects/support имеют собственные папки
            if module_name in ['login', 'register', 'integrations', 'projects', 'support']:
                return module_name
            # Остальные — через blocks
            return 'blocks'
        
        # Проверяем существование модуля
        module_path = os.path.join(os.path.dirname(__file__), module_name)
        if os.path.exists(module_path) and os.path.isdir(module_path):
            return module_name
        
        return None
    
    def _serve_file(self, file_path):
        """Раздача файлов из БД по пути /uploads/..."""
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            # Извлекаем путь файла (например, /uploads/2/file_1765552983_1765552983)
            # Ищем файл в БД по file_url
            db_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db')
            conn = psycopg2.connect(db_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute(
                "SELECT file_name, file_type, file_data FROM file_storage WHERE file_url = %s",
                (file_path,)
            )
            file_record = cur.fetchone()
            cur.close()
            conn.close()
            
            print(f"[FILE SERVE] Request for {file_path}: found={file_record is not None}, file_name={file_record['file_name'] if file_record else None}, file_type={file_record['file_type'] if file_record else None}, has_data={bool(file_record['file_data']) if file_record else False}")
            
            if not file_record:
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'File not found'}).encode('utf-8'))
                return
            
            # Определяем Content-Type
            content_type = file_record['file_type'] or 'application/octet-stream'
            # Если file_type не указан, пытаемся определить по расширению файла
            if content_type == 'application/octet-stream' and file_record['file_name']:
                import mimetypes
                guessed_type, _ = mimetypes.guess_type(file_record['file_name'])
                if guessed_type:
                    content_type = guessed_type
            
            # Отправляем файл
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Disposition', f'inline; filename="{file_record["file_name"]}"')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'public, max-age=31536000')
            self.end_headers()
            
            # Если file_data - это bytes, отправляем напрямую
            if file_record['file_data']:
                if isinstance(file_record['file_data'], bytes):
                    self.wfile.write(file_record['file_data'])
                elif isinstance(file_record['file_data'], memoryview):
                    self.wfile.write(file_record['file_data'].tobytes())
                else:
                    # Если это строка (base64), декодируем
                    import base64
                    try:
                        file_data = base64.b64decode(file_record['file_data'])
                        self.wfile.write(file_data)
                    except:
                        # Если не base64, пробуем как bytes
                        self.wfile.write(bytes(file_record['file_data']))
            else:
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'File data not found'}).encode('utf-8'))
                
        except Exception as e:
            import traceback
            print(f"Error serving file {file_path}: {e}")
            print(traceback.format_exc())
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
    
    def _send_response(self, status_code, data):
        """Отправка JSON ответа"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Переопределяем логирование для более читаемого вывода"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Запуск сервера"""
    port = int(os.environ.get('PORT', 8000))
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIHandler)
    
    print(f"🚀 Backend server started on http://localhost:{port}")
    print(f"📡 API endpoints available at http://localhost:{port}/api/")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    # Проверяем наличие DATABASE_URL
    if 'DATABASE_URL' not in os.environ:
        print("⚠️  WARNING: DATABASE_URL environment variable is not set!")
        print("   Please set it before running the server:")
        print("   export DATABASE_URL='postgresql://user:password@localhost:5433/dbname'")
        print("   Or on Windows:")
        print("   set DATABASE_URL=postgresql://user:password@localhost:5433/dbname")
        print("   Or create a .env file in the backend folder with:")
        print("   DATABASE_URL=postgresql://postgres:MyNewPass123!@localhost:5433/myapp_db")
        print()
    else:
        # Показываем информацию о DATABASE_URL для проверки
        db_url = os.environ.get('DATABASE_URL', '')
        if '5433' in db_url:
            print(f"✅ DATABASE_URL настроен с портом 5433")
        elif '5432' in db_url:
            print(f"⚠️  WARNING: DATABASE_URL использует порт 5432, но PostgreSQL работает на 5433!")
            print(f"   Пожалуйста, обновите .env файл или переменную окружения на порт 5433")
        # Показываем только хост и порт для безопасности
        if '@' in db_url:
            url_part = db_url.split('@')[1]
            print(f"📊 Подключение к: {url_part}")
    
    main()

