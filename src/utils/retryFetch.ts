// Утилита для повторных попыток запросов

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Утилита для повторных попыток выполнения fetch запросов
 */
export const retryFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
  }
): Promise<Response> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error: Error) => {
      return error.message.includes('network') || error.message.includes('fetch') || error.message.includes('HTTP 5');
    },
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);
      
      // Проверяем статус ответа
      if (!response.ok) {
        if (response.status >= 500 && attempt < maxRetries) {
          // Пробуем снова для 5xx ошибок
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      return response;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Проверяем условие ретрая
      if (retryCondition && !retryCondition(lastError)) {
        throw lastError;
      }
      
      // Если это последняя попытка, выбрасываем ошибку
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Ждем перед следующей попыткой (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }
  
  throw lastError || new Error('Unknown error');
};


