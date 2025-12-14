# Backend Server

Локальный сервер для запуска бэкенд-функций.

## Установка зависимостей

```bash
pip install -r requirements.txt
```

**Примечание:** Если возникает конфликт зависимостей с `pydantic-settings`, убедитесь, что установлена версия `pydantic>=2.7.0`. Все файлы `requirements.txt` уже обновлены.

## Настройка переменных окружения

Установите переменную окружения `DATABASE_URL`:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

**Windows (CMD):**
```cmd
set DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**Linux/Mac:**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

## Запуск сервера

```bash
python server.py
```

Сервер запустится на `http://localhost:8000`

## API Endpoints

- `GET/POST /api/blocks` - Работа с блоками
- `GET/POST /api/projects` - Работа с проектами
- `POST /api/login` - Авторизация
- `POST /api/register` - Регистрация
- `GET/POST /api/integrations` - Интеграции
- `GET/POST /api/roles` - Роли
- `GET/POST /api/permissions` - Права доступа

## Структура

Каждая функция находится в отдельной папке:
- `blocks/` - Универсальный обработчик для блоков, ботов, маркетплейса и биржи
- `projects/` - Управление проектами
- `login/` - Авторизация
- `register/` - Регистрация
- `integrations/` - Интеграции форм
- `roles/` - Управление ролями

