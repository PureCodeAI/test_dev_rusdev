import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // в миллисекундах
  onSave: () => Promise<void>;
  onSaveError?: (error: Error) => void;
  debounceMs?: number; // задержка перед сохранением после последнего изменения
}

export const useAutoSave = ({
  enabled = true,
  interval = 30000, // 30 секунд по умолчанию
  onSave,
  onSaveError,
  debounceMs = 2000 // 2 секунды дебаунс
}: UseAutoSaveOptions) => {
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<Date | null>(null);
  const isSavingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      await onSave();
      lastSaveTimeRef.current = new Date();
      hasUnsavedChangesRef.current = false;
    } catch (error) {
      hasUnsavedChangesRef.current = true;
      if (onSaveError) {
        onSaveError(error instanceof Error ? error : new Error('Ошибка сохранения'));
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onSaveError]);

  const triggerSave = useCallback(() => {
    if (!enabled) return;
    
    hasUnsavedChangesRef.current = true;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [enabled, debounceMs, performSave]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (hasUnsavedChangesRef.current && !isSavingRef.current) {
        performSave();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, interval, performSave]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current && !isSavingRef.current) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    triggerSave,
    performSave,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
    isSaving: isSavingRef.current,
    lastSaveTime: lastSaveTimeRef.current
  };
};

