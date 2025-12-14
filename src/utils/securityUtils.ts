/**
 * Утилиты для обеспечения безопасности
 * XSS защита, CSRF защита, SQL injection защита, валидация данных
 */

/**
 * Санитизация HTML для защиты от XSS атак
 * Удаляет опасные теги и атрибуты
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Экранирование HTML символов
 */
export const escapeHTML = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Разрешенные HTML теги для безопасного рендеринга
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'blockquote', 'code', 'pre'
];

/**
 * Разрешенные атрибуты для HTML тегов
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'div': ['class', 'id'],
  'span': ['class', 'id'],
  'p': ['class'],
  'h1': ['class'],
  'h2': ['class'],
  'h3': ['class'],
  'h4': ['class'],
  'h5': ['class'],
  'h6': ['class']
};

/**
 * Безопасная санитизация HTML с сохранением разрешенных тегов
 */
export const sanitizeHTMLWithTags = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const sanitizeNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHTML(node.textContent || '');
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (!ALLOWED_TAGS.includes(tagName)) {
        return Array.from(element.childNodes)
          .map(child => sanitizeNode(child))
          .join('');
      }

      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
      const attributes: string[] = [];

      Array.from(element.attributes).forEach(attr => {
        if (allowedAttrs.includes(attr.name)) {
          if (attr.name === 'href' || attr.name === 'src') {
            const url = attr.value;
            if (isSafeURL(url)) {
              attributes.push(`${attr.name}="${escapeHTML(url)}"`);
            }
          } else {
            attributes.push(`${attr.name}="${escapeHTML(attr.value)}"`);
          }
        }
      });

      const attrsStr = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
      const children = Array.from(element.childNodes)
        .map(child => sanitizeNode(child))
        .join('');

      return `<${tagName}${attrsStr}>${children}</${tagName}>`;
    }

    return '';
  };

  return Array.from(body.childNodes)
    .map(node => sanitizeNode(node))
    .join('');
};

/**
 * Проверка безопасности URL
 */
export const isSafeURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url, window.location.origin);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }

    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Генерация CSRF токена
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Валидация CSRF токена
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) {
    return false;
  }

  return token === storedToken && token.length === 64;
};

/**
 * Экранирование строк для защиты от SQL injection
 * ВАЖНО: Это базовая защита на фронтенде. Основная защита должна быть на бэкенде!
 */
export const escapeSQL = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
};

/**
 * Валидация email адреса
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Валидация URL
 */
export const validateURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Валидация пароля (минимум 8 символов, буквы и цифры)
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Пароль обязателен' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Пароль должен содержать минимум 8 символов' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать буквы' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать цифры' };
  }

  return { valid: true, message: '' };
};

/**
 * Валидация телефона (российский формат)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('7') || cleaned.length === 10;
};

/**
 * Валидация ИНН (российский)
 */
export const validateINN = (inn: string): boolean => {
  if (!inn || typeof inn !== 'string') {
    return false;
  }

  const cleaned = inn.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 12;
};

/**
 * Валидация данных формы
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
  message?: string;
}

export const validateField = (
  value: unknown,
  rules: ValidationRule
): { valid: boolean; message: string } => {
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return {
        valid: false,
        message: rules.message || 'Это поле обязательно для заполнения'
      };
    }
  }

  if (value === null || value === undefined || value === '') {
    return { valid: true, message: '' };
  }

  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return {
        valid: false,
        message: rules.message || `Минимум ${rules.minLength} символов`
      };
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return {
        valid: false,
        message: rules.message || `Максимум ${rules.maxLength} символов`
      };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        valid: false,
        message: rules.message || 'Неверный формат'
      };
    }
  }

  if (rules.custom) {
    const result = rules.custom(value);
    if (result === false) {
      return {
        valid: false,
        message: rules.message || 'Неверное значение'
      };
    }
    if (typeof result === 'string') {
      return {
        valid: false,
        message: result
      };
    }
  }

  return { valid: true, message: '' };
};

/**
 * Валидация объекта с правилами
 */
export const validateObject = <T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(key => {
    const rule = rules[key as keyof T];
    const value = data[key];
    const result = validateField(value, rule);

    if (!result.valid) {
      errors[key] = result.message;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

