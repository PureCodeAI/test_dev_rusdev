/**
 * Утилиты для работы с адаптивностью
 * Функции для работы с брейкпоинтами и адаптивными стилями
 */

export type Breakpoint = 'desktop-1920' | 'desktop-1440' | 'desktop-1280' | 'tablet-1024' | 'tablet-768' | 'mobile-480' | 'mobile-375' | 'custom';

export interface ResponsiveStyles {
  desktop?: Record<string, unknown>;
  tablet?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
  custom?: Record<string, Record<string, unknown>>;
}

export interface BreakpointConfig {
  value: Breakpoint;
  label: string;
  width: number;
  device: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Конфигурация брейкпоинтов
 */
export const BREAKPOINTS: BreakpointConfig[] = [
  { value: 'desktop-1920', label: 'Desktop 1920px', width: 1920, device: 'desktop' },
  { value: 'desktop-1440', label: 'Desktop 1440px', width: 1440, device: 'desktop' },
  { value: 'desktop-1280', label: 'Desktop 1280px', width: 1280, device: 'desktop' },
  { value: 'tablet-1024', label: 'Tablet 1024px', width: 1024, device: 'tablet' },
  { value: 'tablet-768', label: 'Tablet 768px', width: 768, device: 'tablet' },
  { value: 'mobile-480', label: 'Mobile 480px', width: 480, device: 'mobile' },
  { value: 'mobile-375', label: 'Mobile 375px', width: 375, device: 'mobile' },
  { value: 'custom', label: 'Custom', width: 0, device: 'desktop' }
];

/**
 * Получение устройства из брейкпоинта
 */
export const getDeviceFromBreakpoint = (breakpoint: Breakpoint): 'desktop' | 'tablet' | 'mobile' => {
  if (breakpoint.startsWith('desktop')) return 'desktop';
  if (breakpoint.startsWith('tablet')) return 'tablet';
  if (breakpoint.startsWith('mobile')) return 'mobile';
  return 'desktop';
};

/**
 * Получение конфигурации брейкпоинта
 */
export const getBreakpointConfig = (breakpoint: Breakpoint): BreakpointConfig | null => {
  return BREAKPOINTS.find(bp => bp.value === breakpoint) || null;
};

/**
 * Получение ширины брейкпоинта
 */
export const getBreakpointWidth = (breakpoint: Breakpoint): number => {
  const config = getBreakpointConfig(breakpoint);
  return config ? config.width : 0;
};

/**
 * Получение стилей для устройства
 */
export const getDeviceStyles = (
  responsiveStyles: ResponsiveStyles,
  device: 'desktop' | 'tablet' | 'mobile'
): Record<string, unknown> => {
  return responsiveStyles[device] || {};
};

/**
 * Обновление стилей для устройства
 */
export const updateDeviceStyles = (
  responsiveStyles: ResponsiveStyles,
  device: 'desktop' | 'tablet' | 'mobile',
  styles: Record<string, unknown>
): ResponsiveStyles => {
  return {
    ...responsiveStyles,
    [device]: {
      ...(responsiveStyles[device] || {}),
      ...styles
    }
  };
};

/**
 * Получение стилей для текущего брейкпоинта
 */
export const getBreakpointStyles = (
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint
): Record<string, unknown> => {
  const device = getDeviceFromBreakpoint(breakpoint);
  return getDeviceStyles(responsiveStyles, device);
};

/**
 * Объединение базовых стилей с адаптивными
 */
export const mergeResponsiveStyles = (
  baseStyles: Record<string, unknown>,
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint
): Record<string, unknown> => {
  const deviceStyles = getBreakpointStyles(responsiveStyles, breakpoint);
  return { ...baseStyles, ...deviceStyles };
};

/**
 * Генерация CSS media queries из адаптивных стилей
 */
export const generateMediaQueries = (responsiveStyles: ResponsiveStyles): string => {
  const queries: string[] = [];

  if (responsiveStyles.tablet) {
    queries.push(`
      @media (max-width: 1024px) {
        ${stylesToCSS(responsiveStyles.tablet)}
      }
    `);
  }

  if (responsiveStyles.mobile) {
    queries.push(`
      @media (max-width: 768px) {
        ${stylesToCSS(responsiveStyles.mobile)}
      }
    `);
  }

  return queries.join('\n');
};

/**
 * Преобразование стилей в CSS строку
 */
const stylesToCSS = (styles: Record<string, unknown>): string => {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${cssKey}: ${value};`;
    })
    .join('\n');
};

/**
 * Определение текущего брейкпоинта по ширине окна
 */
export const detectBreakpoint = (width: number): Breakpoint => {
  if (width >= 1920) return 'desktop-1920';
  if (width >= 1440) return 'desktop-1440';
  if (width >= 1280) return 'desktop-1280';
  if (width >= 1024) return 'tablet-1024';
  if (width >= 768) return 'tablet-768';
  if (width >= 480) return 'mobile-480';
  return 'mobile-375';
};

/**
 * Проверка, скрыт ли элемент на устройстве
 */
export const isHiddenOnDevice = (
  styles: Record<string, unknown>,
  device: 'desktop' | 'tablet' | 'mobile'
): boolean => {
  const displayKey = `display_${device}`;
  return styles[displayKey] === 'none';
};

/**
 * Установка видимости элемента на устройстве
 */
export const setDeviceVisibility = (
  styles: Record<string, unknown>,
  device: 'desktop' | 'tablet' | 'mobile',
  hidden: boolean
): Record<string, unknown> => {
  return {
    ...styles,
    [`display_${device}`]: hidden ? 'none' : 'block'
  };
};

/**
 * Клонирование адаптивных стилей
 */
export const cloneResponsiveStyles = (responsiveStyles: ResponsiveStyles): ResponsiveStyles => {
  return {
    desktop: responsiveStyles.desktop ? { ...responsiveStyles.desktop } : undefined,
    tablet: responsiveStyles.tablet ? { ...responsiveStyles.tablet } : undefined,
    mobile: responsiveStyles.mobile ? { ...responsiveStyles.mobile } : undefined,
    custom: responsiveStyles.custom ? { ...responsiveStyles.custom } : undefined
  };
};

/**
 * Очистка пустых адаптивных стилей
 */
export const cleanResponsiveStyles = (responsiveStyles: ResponsiveStyles): ResponsiveStyles => {
  const cleaned: ResponsiveStyles = {};

  if (responsiveStyles.desktop && Object.keys(responsiveStyles.desktop).length > 0) {
    cleaned.desktop = responsiveStyles.desktop;
  }

  if (responsiveStyles.tablet && Object.keys(responsiveStyles.tablet).length > 0) {
    cleaned.tablet = responsiveStyles.tablet;
  }

  if (responsiveStyles.mobile && Object.keys(responsiveStyles.mobile).length > 0) {
    cleaned.mobile = responsiveStyles.mobile;
  }

  if (responsiveStyles.custom && Object.keys(responsiveStyles.custom).length > 0) {
    cleaned.custom = responsiveStyles.custom;
  }

  return cleaned;
};

