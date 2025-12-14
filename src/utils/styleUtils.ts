/**
 * Утилиты для работы со стилями
 * Функции для преобразования, валидации и работы со стилями блоков
 */

export interface StyleValue {
  value: string | number;
  unit?: string;
}

/**
 * Получение значения стиля с дефолтным значением
 */
export const getStyleValue = (
  styles: Record<string, unknown>,
  key: string,
  defaultValue: string | number = ''
): string | number => {
  return (styles[key] as string | number) || defaultValue;
};

/**
 * Обновление стиля
 */
export const updateStyle = (
  styles: Record<string, unknown>,
  key: string,
  value: unknown
): Record<string, unknown> => {
  return { ...styles, [key]: value };
};

/**
 * Обновление нескольких стилей одновременно
 */
export const updateStyles = (
  styles: Record<string, unknown>,
  updates: Record<string, unknown>
): Record<string, unknown> => {
  return { ...styles, ...updates };
};

/**
 * Удаление стиля
 */
export const removeStyle = (
  styles: Record<string, unknown>,
  key: string
): Record<string, unknown> => {
  const newStyles = { ...styles };
  delete newStyles[key];
  return newStyles;
};

/**
 * Парсинг значения с единицей измерения
 */
export const parseStyleValue = (value: string | number): StyleValue => {
  if (typeof value === 'number') {
    return { value, unit: '' };
  }

  const match = value.toString().match(/^([\d.]+)([a-z%]*)$/i);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] || ''
    };
  }

  return { value: value.toString(), unit: '' };
};

/**
 * Форматирование значения стиля с единицей
 */
export const formatStyleValue = (value: StyleValue | string | number): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return value.toString();
  }

  return `${value.value}${value.unit || ''}`;
};

/**
 * Валидация CSS значения
 */
export const validateCSSValue = (key: string, value: string | number): boolean => {
  if (typeof value === 'number') {
    return !isNaN(value);
  }

  const stringValue = value.toString().trim();
  if (stringValue === '' || stringValue === 'auto' || stringValue === 'inherit' || stringValue === 'initial') {
    return true;
  }

  const cssKeywords = ['none', 'block', 'flex', 'grid', 'inline', 'inline-block', 'relative', 'absolute', 'fixed', 'sticky'];
  if (cssKeywords.includes(stringValue)) {
    return true;
  }

  const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-z]+)$/;
  if (colorRegex.test(stringValue)) {
    return true;
  }

  const sizeRegex = /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/;
  return sizeRegex.test(stringValue);
};

/**
 * Преобразование объекта стилей в CSS строку
 */
export const stylesToCSS = (styles: Record<string, unknown>): string => {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
};

/**
 * Преобразование CSS строки в объект стилей
 */
export const cssToStyles = (css: string): Record<string, unknown> => {
  const styles: Record<string, unknown> = {};
  const declarations = css.split(';').filter(decl => decl.trim());

  declarations.forEach(decl => {
    const [key, value] = decl.split(':').map(s => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styles[camelKey] = value;
    }
  });

  return styles;
};

/**
 * Слияние стилей (приоритет у второго объекта)
 */
export const mergeStyles = (
  baseStyles: Record<string, unknown>,
  overrideStyles: Record<string, unknown>
): Record<string, unknown> => {
  return { ...baseStyles, ...overrideStyles };
};

/**
 * Клонирование стилей
 */
export const cloneStyles = (styles: Record<string, unknown>): Record<string, unknown> => {
  return { ...styles };
};

/**
 * Очистка пустых значений из стилей
 */
export const cleanStyles = (styles: Record<string, unknown>): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(styles).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

/**
 * Применение стилей к элементу
 */
export const applyStyles = (element: HTMLElement, styles: Record<string, unknown>): void => {
  Object.entries(styles).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    (element.style as Record<string, unknown>)[cssKey] = value;
  });
};

/**
 * Получение вычисленных стилей элемента
 */
export const getComputedStyles = (element: HTMLElement): Record<string, string> => {
  const computed = window.getComputedStyle(element);
  const styles: Record<string, string> = {};
  
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i];
    styles[prop] = computed.getPropertyValue(prop);
  }
  
  return styles;
};

