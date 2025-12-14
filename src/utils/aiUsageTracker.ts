// Утилита для отслеживания использования AI токенов

import API_ENDPOINTS from '@/config/api';
import { logger } from './logger';

const MODEL_PRICING: Record<string, number> = {
  'gpt4': 0.03, // ₽ за 1K токенов
  'claude': 0.025,
  'gemini': 0.02,
  'gpt-3.5-turbo': 0.002,
};

export interface AIUsageRecord {
  model: string;
  tokensUsed: number;
  source: 'academy' | 'chat' | 'university' | 'other';
}

/**
 * Отслеживает использование AI токенов
 */
export const trackAIUsage = async (
  model: string,
  tokensUsed: number,
  source: AIUsageRecord['source']
): Promise<void> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const cost = calculateCost(model, tokensUsed);

    const response = await fetch('/api/ai-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({
        model,
        tokens_used: tokensUsed,
        cost,
        source,
      }),
    });

    if (!response.ok) {
      logger.warn('Failed to track AI usage', { model, tokensUsed, source, userId });
    }
  } catch (error) {
    // Игнорируем ошибки отслеживания, но логируем их
    logger.error('Error tracking AI usage', error instanceof Error ? error : new Error(String(error)), { model, tokensUsed, source });
  }
};

/**
 * Вычисляет стоимость использования AI
 */
export const calculateCost = (model: string, tokensUsed: number): number => {
  const pricePer1K = MODEL_PRICING[model] || MODEL_PRICING['gpt4'];
  return (tokensUsed / 1000) * pricePer1K;
};

/**
 * Получает статистику использования за месяц
 */
export const getMonthlyUsage = async (userId?: number): Promise<{
  tokensUsed: number;
  cost: number;
}> => {
  try {
    if (!userId) {
      return { tokensUsed: 0, cost: 0 };
    }

      const response = await fetch(`${API_ENDPOINTS.aiUsage}/monthly`, {
      headers: {
        'X-User-Id': String(userId),
      },
    });

    if (!response.ok) {
      return { tokensUsed: 0, cost: 0 };
    }

    const data = await response.json();
    return {
      tokensUsed: Number(data.tokens_used || 0),
      cost: Number(data.total_cost || data.cost || 0),
    };
  } catch (error) {
    return { tokensUsed: 0, cost: 0 };
  }
};

/**
 * Оценивает количество токенов в тексте (приблизительно)
 */
export const estimateTokens = (text: string): number => {
  // Приблизительная оценка: 1 токен ≈ 4 символа для русского/английского текста
  return Math.ceil(text.length / 4);
};

