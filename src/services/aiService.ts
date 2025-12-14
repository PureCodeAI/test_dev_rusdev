// Сервис для работы с AI через OpenRouter и другие API

import type { AIConfig, AIMessage, AIRequest, AIResponse } from '@/types/ai';
import API_ENDPOINTS from '@/config/api';
import { logger } from '@/utils/logger';

// Получить конфигурацию AI из админки
export const getAIConfig = async (): Promise<AIConfig | null> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.blocks}?type=admin&action=ai_config`);
    if (response.ok) {
      const data = await response.json();
      return data as AIConfig;
    }
    return null;
  } catch (error) {
    logger.error('Error loading AI config', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

// Сохранить конфигурацию AI в админке
export const saveAIConfig = async (config: AIConfig): Promise<boolean> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.blocks}?type=admin&action=ai_config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    return response.ok;
  } catch (error) {
    logger.error('Error saving AI config', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

// Получить настройки для конкретного типа генерации
const getConfigForType = (config: AIConfig, type: 'site' | 'bot' | 'course' | 'chat') => {
  if (config.useGlobalConfig && config.globalApiKey && config.globalApiUrl && config.globalModel) {
    return {
      apiKey: config.globalApiKey,
      apiUrl: config.globalApiUrl,
      model: config.globalModel,
    };
  }
  
  switch (type) {
    case 'site':
      return {
        apiKey: config.siteGeneration.apiKey || '',
        apiUrl: config.siteGeneration.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: config.siteGeneration.model || '',
      };
    case 'bot':
      return {
        apiKey: config.botGeneration.apiKey || '',
        apiUrl: config.botGeneration.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: config.botGeneration.model || '',
      };
    case 'course':
      return {
        apiKey: config.courseGeneration.apiKey || '',
        apiUrl: config.courseGeneration.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: config.courseGeneration.model || '',
      };
    case 'chat':
      return {
        apiKey: config.chats.apiKey || '',
        apiUrl: config.chats.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: config.chats.model || '',
      };
  }
};

// Отправить запрос к AI
export const callAI = async (
  messages: AIMessage[],
  type: 'site' | 'bot' | 'course' | 'chat',
  options?: {
    temperature?: number;
    max_tokens?: number;
    userRules?: string; // Правила чата от пользователя
    aiRules?: string; // AI правила из админки
  }
): Promise<AIResponse | null> => {
  try {
    const config = await getAIConfig();
    if (!config) {
      throw new Error('AI config not found');
    }
    
    const typeConfig = getConfigForType(config, type);
    if (!typeConfig.apiKey || !typeConfig.model) {
      throw new Error(`AI config for ${type} not configured`);
    }
    
    // Добавляем system message с правилами
    const systemMessages: AIMessage[] = [];
    
    // Добавляем AI правила из админки
    if (options?.aiRules) {
      systemMessages.push({
        role: 'system',
        content: options.aiRules,
      });
    }
    
    // Добавляем правила пользователя (для чатов)
    if (options?.userRules) {
      systemMessages.push({
        role: 'system',
        content: `Дополнительные правила от пользователя: ${options.userRules}`,
      });
    }
    
    const allMessages = [...systemMessages, ...messages];
    
    const request: AIRequest = {
      model: typeConfig.model,
      messages: allMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
    };
    
    const response = await fetch(typeConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${typeConfig.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Public Pages Platform',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens;
    const modelUsed = data.model;
    
    // Отслеживаем использование токенов
    if (tokensUsed) {
      const { trackAIUsage } = await import('@/utils/aiUsageTracker');
      const source = type === 'chat' ? 'chat' : 'other';
      await trackAIUsage('openrouter', tokensUsed, source);
    }
    
    return {
      content,
      tokens_used: tokensUsed,
      model_used: modelUsed,
    };
  } catch (error) {
    logger.error('Error calling AI', error instanceof Error ? error : new Error(String(error)), { type });
    return null;
  }
};

// Генерация сайта через AI
export const generateSiteWithAI = async (
  userPrompt: string,
  options?: {
    siteType?: string;
    features?: string[];
  }
): Promise<string | null> => {
  const config = await getAIConfig();
  if (!config || !config.siteGeneration.enabled) {
    throw new Error('Site generation is not enabled');
  }
  
  const basePrompt = config.siteGeneration.prompt || `Ты эксперт по созданию веб-сайтов. 
Создай структуру и контент для сайта на основе требований пользователя.
Верни результат в формате JSON с полями: title, description, sections (массив секций с полями: type, title, content, settings).`;
  
  const messages: AIMessage[] = [
    {
      role: 'user',
      content: `${basePrompt}\n\nТребования пользователя: ${userPrompt}\n${options?.siteType ? `Тип сайта: ${options.siteType}` : ''}\n${options?.features ? `Особенности: ${options.features.join(', ')}` : ''}`,
    },
  ];
  
  const response = await callAI(messages, 'site', {
    aiRules: config.siteGeneration.aiRules,
    userRules: userPrompt,
  });
  
  return response?.content || null;
};

// Генерация бота через AI
export const generateBotWithAI = async (
  userPrompt: string,
  options?: {
    platform?: string;
    features?: string[];
  }
): Promise<string | null> => {
  const config = await getAIConfig();
  if (!config || !config.botGeneration.enabled) {
    throw new Error('Bot generation is not enabled');
  }
  
  const basePrompt = config.botGeneration.prompt || `Ты эксперт по созданию чат-ботов.
Создай структуру и сценарий для бота на основе требований пользователя.
Верни результат в формате JSON с полями: name, description, nodes (массив узлов с полями: type, title, content, connections).`;
  
  const messages: AIMessage[] = [
    {
      role: 'user',
      content: `${basePrompt}\n\nТребования пользователя: ${userPrompt}\n${options?.platform ? `Платформа: ${options.platform}` : ''}\n${options?.features ? `Особенности: ${options.features.join(', ')}` : ''}`,
    },
  ];
  
  const response = await callAI(messages, 'bot', {
    aiRules: config.botGeneration.aiRules,
    userRules: userPrompt,
  });
  
  return response?.content || null;
};

// Промпты для генерации курсов (хранятся в коде)
const COURSE_GENERATION_PROMPTS = {
  main: `Ты эксперт по созданию образовательных курсов.
На основе данных онбординга создай структурированный курс с уроками, тестами и практическими заданиями.
Верни результат в формате JSON с полями: courses (массив курсов с полями: id, title, description, lessons, test).`,
  
  lesson: `Создай детальный урок для курса. Урок должен включать:
- Теоретический материал
- Практические примеры
- Интерактивные элементы
- Визуальные материалы (описание)`,
  
  test: `Создай тест для проверки знаний. Тест должен включать:
- Вопросы с вариантами ответов
- Правильные ответы
- Объяснения`,
};

// Генерация курсов через AI
export const generateCoursesWithAI = async (
  onboardingData: Record<string, unknown>
): Promise<string | null> => {
  const config = await getAIConfig();
  if (!config || !config.courseGeneration.enabled) {
    throw new Error('Course generation is not enabled');
  }
  
  const messages: AIMessage[] = [
    {
      role: 'user',
      content: `${COURSE_GENERATION_PROMPTS.main}\n\nДанные онбординга: ${JSON.stringify(onboardingData, null, 2)}`,
    },
  ];
  
  const response = await callAI(messages, 'course');
  
  return response?.content || null;
};

// Получить AI правила для режима
export const getAIRulesForMode = async (mode: 'universal' | 'site' | 'ads' | 'accountant'): Promise<string | null> => {
  try {
    const config = await getAIConfig();
    if (!config) return null;
    
    return config.chatModes?.[mode]?.aiRules || config.chats.aiRules || null;
  } catch (error) {
    logger.error('Error getting AI rules for mode', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

// Отправить сообщение в чат
export const sendChatMessage = async (
  chatType: 'universal' | 'site' | 'ads' | 'accountant',
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userRules?: string,
  userName?: string
): Promise<AIResponse | null> => {
  const config = await getAIConfig();
  if (!config || !config.chats.enabled) {
    throw new Error('Chats are not enabled');
  }
  
  // Получаем AI правила для выбранного режима
  const modeRules = config.chatModes?.[chatType]?.aiRules || config.chats.aiRules;
  
  // Ограничиваем историю
  const maxHistory = config.chats.maxHistoryMessages || 50;
  const limitedHistory = history.slice(-maxHistory);
  
  // Собираем все сообщения
  const messages: AIMessage[] = [];
  
  // Добавляем AI правила режима
  if (modeRules) {
    let rulesWithUserName = modeRules;
    if (userName) {
      rulesWithUserName += `\n\nИмя пользователя: ${userName}. Всегда обращайся к нему по имени.`;
    }
    messages.push({
      role: 'system',
      content: rulesWithUserName,
    });
  }
  
  // Добавляем правила пользователя
  if (userRules) {
    messages.push({
      role: 'system',
      content: `Дополнительные правила от пользователя: ${userRules}`,
    });
  }
  
  // Добавляем историю и текущее сообщение
  messages.push(...limitedHistory.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  })));
  
  messages.push({
    role: 'user',
    content: message,
  });
  
  const response = await callAI(messages, 'chat', {
    temperature: config.chatModes?.[chatType]?.temperature ?? 0.7,
    max_tokens: config.chatModes?.[chatType]?.maxTokens ?? 2000,
    aiRules: modeRules,
    userRules,
  });
  
  return response;
};

// Сохранить пользовательские настройки чата
export const saveUserChatPreferences = async (
  userId: number,
  chatType: string,
  preferences: {
    userRules?: string;
    userName?: string;
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.blocks}?type=ai_chat&action=save_preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(userId),
      },
      body: JSON.stringify({
        chat_type: chatType,
        ...preferences,
      }),
    });
    return response.ok;
  } catch (error) {
    logger.error('Error saving user preferences', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

// Загрузить пользовательские настройки чата
export const loadUserChatPreferences = async (
  userId: number,
  chatType: string
): Promise<{ userRules?: string; userName?: string } | null> => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.blocks}?type=ai_chat&action=get_preferences&user_id=${userId}&chat_type=${chatType}`
    );
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    logger.error('Error loading user preferences', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

// Функция для проверки доступности AI
export const checkAIAvailability = async (type: 'site' | 'bot' | 'course' | 'chat'): Promise<{
  available: boolean;
  reason?: string;
}> => {
  try {
    const config = await getAIConfig();
    
    if (!config) {
      return { available: false, reason: 'AI config not found' };
    }
    
    switch (type) {
      case 'site':
        if (!config.siteGeneration.enabled) {
          return { available: false, reason: 'Site generation disabled' };
        }
        break;
      case 'bot':
        if (!config.botGeneration.enabled) {
          return { available: false, reason: 'Bot generation disabled' };
        }
        break;
      case 'course':
        if (!config.courseGeneration.enabled) {
          return { available: false, reason: 'Course generation disabled' };
        }
        break;
      case 'chat':
        if (!config.chats.enabled) {
          return { available: false, reason: 'Chats disabled' };
        }
        break;
    }
    
    // Проверяем наличие API ключа
    const typeConfig = getConfigForType(config, type);
    if (!typeConfig.apiKey || !typeConfig.model) {
      return { available: false, reason: 'API key or model not configured' };
    }
    
    return { available: true };
    
  } catch (error) {
    logger.error('Error checking AI availability', error instanceof Error ? error : new Error(String(error)));
    return { available: false, reason: 'Internal error' };
  }
};

// Функция для получения информации о моделях
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const config = await getAIConfig();
    if (!config) return [];
    
    const models = new Set<string>();
    
    if (config.useGlobalConfig && config.globalModel) {
      models.add(config.globalModel);
    }
    
    if (config.siteGeneration.model) {
      models.add(config.siteGeneration.model);
    }
    
    if (config.botGeneration.model) {
      models.add(config.botGeneration.model);
    }
    
    if (config.courseGeneration.model) {
      models.add(config.courseGeneration.model);
    }
    
    if (config.chats.model) {
      models.add(config.chats.model);
    }
    
    return Array.from(models);
    
  } catch (error) {
    logger.error('Error getting available models', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

