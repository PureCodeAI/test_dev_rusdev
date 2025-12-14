// Типы для работы с AI

export interface AIConfig {
  // Общие настройки (можно использовать одну модель на все)
  useGlobalConfig: boolean;
  globalApiKey?: string;
  globalApiUrl?: string;
  globalModel?: string;
  
  // Настройки для генерации сайтов
  siteGeneration: {
    enabled: boolean;
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    prompt?: string; // Базовый промпт
    aiRules?: string; // AI правила
  };
  
  // Настройки для генерации ботов
  botGeneration: {
    enabled: boolean;
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    prompt?: string; // Базовый промпт
    aiRules?: string; // AI правила
  };
  
  // Настройки для генерации курсов
  courseGeneration: {
    enabled: boolean;
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    // Промпты для курсов хранятся в коде
  };
  
  // Настройки для чатов
  chats: {
    enabled: boolean;
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    maxHistoryMessages: number; // Максимальное количество сообщений в истории
    aiRules?: string; // AI правила для чатов (общие)
  };
  
  // AI правила для каждого режима чата
  chatModes?: {
    universal: {
      aiRules: string; // AI правила для универсального режима
      temperature?: number;
      maxTokens?: number;
    };
    site: {
      aiRules: string; // AI правила для помощи с сайтом
      temperature?: number;
      maxTokens?: number;
    };
    ads: {
      aiRules: string; // AI правила для консультанта по рекламе
      temperature?: number;
      maxTokens?: number;
    };
    accountant: {
      aiRules: string; // AI правила для бухгалтера
      temperature?: number;
      maxTokens?: number;
    };
  };
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface AIResponse {
  content: string;
  tokens_used?: number;
  model_used?: string;
}

export interface ChatHistory {
  id: string;
  chatType: 'universal' | 'site' | 'ads' | 'accountant';
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  userRules?: string; // Правила чата, заданные пользователем
  userName?: string; // Имя пользователя
  createdAt: string;
  updatedAt: string;
}

