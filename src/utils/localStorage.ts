// Безопасная работа с localStorage

import { logger } from './logger';

export const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logger.error('Error accessing localStorage', error instanceof Error ? error : new Error(String(error)), { key });
    return null;
  }
};

export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logger.error('Storage quota exceeded', error, { key, valueLength: value.length });
      return false;
    }
    logger.error('Error saving to localStorage', error instanceof Error ? error : new Error(String(error)), { key });
    return false;
  }
};

export const safeLocalStorageRemove = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error('Error removing from localStorage', error instanceof Error ? error : new Error(String(error)), { key });
    return false;
  }
};

export const safeLocalStorageParse = <T>(key: string, defaultValue: T): T => {
  try {
    const data = safeLocalStorageGet(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error('Error parsing localStorage data', error instanceof Error ? error : new Error(String(error)), { key });
    return defaultValue;
  }
};


