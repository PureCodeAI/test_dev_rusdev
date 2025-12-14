// Система структурированного логирования

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  private formatMessage(level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as Error : undefined,
      context,
      timestamp: new Date().toISOString()
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false;
    }
    return true;
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.formatMessage('error', message, error, context);
    this.addToHistory(entry);

    if (this.shouldLog('error')) {
      if (error) {
        console.error(`[ERROR] ${message}`, error, context || '');
      } else {
        console.error(`[ERROR] ${message}`, context || '');
      }

      // В production можно отправлять критические ошибки на сервер
      if (!this.isDevelopment && error) {
        this.sendToServer(entry).catch(() => {
          // Игнорируем ошибки отправки логов
        });
      }
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.formatMessage('warn', message, undefined, context);
    this.addToHistory(entry);

    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.formatMessage('info', message, undefined, context);
    this.addToHistory(entry);

    if (this.shouldLog('info') && this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.isDevelopment) return;

    const entry = this.formatMessage('debug', message, undefined, context);
    this.addToHistory(entry);
    console.debug(`[DEBUG] ${message}`, context || '');
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      // Отправка критических ошибок на сервер для мониторинга
      const response = await fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error('Failed to send log to server');
      }
    } catch (error) {
      // Игнорируем ошибки отправки логов, чтобы не создавать бесконечный цикл
    }
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}

export const logger = new Logger();

