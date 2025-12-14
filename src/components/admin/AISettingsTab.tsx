// Компонент для настройки AI в админке

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { getAIConfig, saveAIConfig } from '@/services/aiService';
import type { AIConfig } from '@/types/ai';
import { logger } from '@/utils/logger';

// Дефолтные AI правила для каждого режима
const DEFAULT_AI_RULES = {
  universal: `Ты — универсальный ассистент, который всегда обращается к пользователю по имени. Сохраняй контекст разговора (до 50 сообщений), чтобы общение было последовательным и персонализированным.

**Ключевые правила:**
1. Всегда используй имя пользователя в обращении (если имя не известно — вежливо спроси в первом сообщении).
2. Поддерживай контекст разговора, ссылайся на предыдущие сообщения при необходимости.
3. Будь вежливым, дружелюбным и полезным в любых темах.
4. Если пользователь меняет тему — плавно переходи на неё, сохраняя контекст.
5. Адаптируй тон общения под настроение пользователя (формальный/неформальный).`,
  
  site: `Ты — эксперт по помощи с сайтами и технической поддержкой. Всегда обращайся к пользователю по имени. Сохраняй историю взаимодействий (до 50 сообщений), чтобы точно понимать контекст проблем.

**Ключевые правила:**
1. Начинай диалог с представления и запроса имени пользователя.
2. Фокусируйся исключительно на темах, связанных с сайтами: настройка, ошибки, SEO, UX/UI, хостинг, домены, безопасность.
3. Задавай уточняющие вопросы для диагностики проблем.
4. Предлагай пошаговые инструкции, скриншоты (если нужно), ссылки на ресурсы.
5. Если проблема вне твоей компетенции — честно скажи, но предложи альтернативы.`,
  
  ads: `Ты — консультант по цифровой рекламе (Google Ads, соцсети, таргетированная реклама). Обращайся к пользователю по имени. Сохраняй историю обсуждений (до 50 сообщений) для анализа рекламных кампаний.

**Ключевые правила:**
1. Узнай имя пользователя и цель запроса.
2. Фокусируйся на рекламе: настройка кампаний, аудитории, бюджеты, креативы, аналитика.
3. Задавай вопросы для анализа текущей ситуации: бюджет, цели, текущие метрики.
4. Давай конкретные, измеримые рекомендации.
5. Предлагай варианты A/B-тестов, оптимизации ставок.`,
  
  accountant: `Ты — бухгалтер-консультант. Обращайся к пользователю по имени. Сохраняй контекст финансовых обсуждений (до 50 сообщений) для точных рекомендаций.

**Ключевые правила:**
1. Узнай имя пользователя и сферу деятельности (ИП, ООО, фрилансер).
2. Фокусируйся на бухгалтерии: налоги, отчетность, документооборот.
3. Давай только общие рекомендации (не заменяй профессионального бухгалтера).
4. Уточняй регион пользователя (налоговые законы различаются).
5. Предупреждай о дедлайнах сдачи отчетности.`,
};

export const AISettingsTab = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AIConfig>({
    useGlobalConfig: false,
    siteGeneration: {
      enabled: false,
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    },
    botGeneration: {
      enabled: false,
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    },
    courseGeneration: {
      enabled: false,
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    },
    chats: {
      enabled: false,
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      maxHistoryMessages: 20,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const loadedConfig = await getAIConfig();
      if (loadedConfig) {
        setConfig(loadedConfig);
      }
    } catch (error) {
      logger.error('Error loading AI config', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки AI',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveAIConfig(config);
      if (success) {
        toast({
          title: 'Успешно',
          description: 'Настройки AI сохранены',
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      logger.error('Error saving AI config', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: unknown) => {
    setConfig((prev) => {
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current: Record<string, unknown> = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...(current[key] as Record<string, unknown>) };
        current = current[key] as Record<string, unknown>;
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">AI настройки</h1>
        <p className="text-gray-400">Управление AI моделями и API для генерации контента</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon name="Sparkles" size={20} />
            Общие настройки
          </CardTitle>
          <CardDescription className="text-gray-400">
            Можно использовать одну модель на все или настроить отдельно для каждого типа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Использовать одну модель на все</Label>
              <p className="text-sm text-gray-400">Если включено, будут использоваться общие настройки</p>
            </div>
            <Switch
              checked={config.useGlobalConfig}
              onCheckedChange={(checked) => updateConfig('useGlobalConfig', checked)}
            />
          </div>

          {config.useGlobalConfig && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <Label className="text-white">API Key</Label>
                <Input
                  type="password"
                  value={config.globalApiKey || ''}
                  onChange={(e) => updateConfig('globalApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">API URL</Label>
                <Input
                  value={config.globalApiUrl || 'https://openrouter.ai/api/v1/chat/completions'}
                  onChange={(e) => updateConfig('globalApiUrl', e.target.value)}
                  placeholder="https://openrouter.ai/api/v1/chat/completions"
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Модель</Label>
                <Input
                  value={config.globalModel || ''}
                  onChange={(e) => updateConfig('globalModel', e.target.value)}
                  placeholder="anthropic/claude-3.5-sonnet"
                  className="bg-gray-900 border-gray-700"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sites" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="sites">Генерация сайтов</TabsTrigger>
          <TabsTrigger value="bots">Генерация ботов</TabsTrigger>
          <TabsTrigger value="courses">Генерация курсов</TabsTrigger>
          <TabsTrigger value="chats">Чаты</TabsTrigger>
          <TabsTrigger value="ai-rules">AI правила чатов</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Генерация сайтов</CardTitle>
              <CardDescription className="text-gray-400">
                Настройки AI для генерации сайтов. Промпт и правила задаются в админке, чат правила пишет пользователь при генерации.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Включено</Label>
                <Switch
                  checked={config.siteGeneration.enabled}
                  onCheckedChange={(checked) => updateConfig('siteGeneration.enabled', checked)}
                />
              </div>
              {!config.useGlobalConfig && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">API Key</Label>
                    <Input
                      type="password"
                      value={config.siteGeneration.apiKey || ''}
                      onChange={(e) => updateConfig('siteGeneration.apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">API URL</Label>
                    <Input
                      value={config.siteGeneration.apiUrl || 'https://openrouter.ai/api/v1/chat/completions'}
                      onChange={(e) => updateConfig('siteGeneration.apiUrl', e.target.value)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Модель</Label>
                    <Input
                      value={config.siteGeneration.model || ''}
                      onChange={(e) => updateConfig('siteGeneration.model', e.target.value)}
                      placeholder="anthropic/claude-3.5-sonnet"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label className="text-white">Базовый промпт</Label>
                <Textarea
                  value={config.siteGeneration.prompt || ''}
                  onChange={(e) => updateConfig('siteGeneration.prompt', e.target.value)}
                  placeholder="Ты эксперт по созданию веб-сайтов..."
                  className="bg-gray-900 border-gray-700 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">AI правила</Label>
                <Textarea
                  value={config.siteGeneration.aiRules || ''}
                  onChange={(e) => updateConfig('siteGeneration.aiRules', e.target.value)}
                  placeholder="Всегда используй современный дизайн..."
                  className="bg-gray-900 border-gray-700 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Генерация ботов</CardTitle>
              <CardDescription className="text-gray-400">
                Настройки AI для генерации ботов. Промпт и правила задаются в админке, чат правила пишет пользователь при генерации.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Включено</Label>
                <Switch
                  checked={config.botGeneration.enabled}
                  onCheckedChange={(checked) => updateConfig('botGeneration.enabled', checked)}
                />
              </div>
              {!config.useGlobalConfig && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">API Key</Label>
                    <Input
                      type="password"
                      value={config.botGeneration.apiKey || ''}
                      onChange={(e) => updateConfig('botGeneration.apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">API URL</Label>
                    <Input
                      value={config.botGeneration.apiUrl || 'https://openrouter.ai/api/v1/chat/completions'}
                      onChange={(e) => updateConfig('botGeneration.apiUrl', e.target.value)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Модель</Label>
                    <Input
                      value={config.botGeneration.model || ''}
                      onChange={(e) => updateConfig('botGeneration.model', e.target.value)}
                      placeholder="anthropic/claude-3.5-sonnet"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label className="text-white">Базовый промпт</Label>
                <Textarea
                  value={config.botGeneration.prompt || ''}
                  onChange={(e) => updateConfig('botGeneration.prompt', e.target.value)}
                  placeholder="Ты эксперт по созданию чат-ботов..."
                  className="bg-gray-900 border-gray-700 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">AI правила</Label>
                <Textarea
                  value={config.botGeneration.aiRules || ''}
                  onChange={(e) => updateConfig('botGeneration.aiRules', e.target.value)}
                  placeholder="Всегда создавай понятные сценарии..."
                  className="bg-gray-900 border-gray-700 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Генерация курсов</CardTitle>
              <CardDescription className="text-gray-400">
                Настройки AI для генерации курсов. Промпты хранятся в коде.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Включено</Label>
                <Switch
                  checked={config.courseGeneration.enabled}
                  onCheckedChange={(checked) => updateConfig('courseGeneration.enabled', checked)}
                />
              </div>
              {!config.useGlobalConfig && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">API Key</Label>
                    <Input
                      type="password"
                      value={config.courseGeneration.apiKey || ''}
                      onChange={(e) => updateConfig('courseGeneration.apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">API URL</Label>
                    <Input
                      value={config.courseGeneration.apiUrl || 'https://openrouter.ai/api/v1/chat/completions'}
                      onChange={(e) => updateConfig('courseGeneration.apiUrl', e.target.value)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Модель</Label>
                    <Input
                      value={config.courseGeneration.model || ''}
                      onChange={(e) => updateConfig('courseGeneration.model', e.target.value)}
                      placeholder="anthropic/claude-3.5-sonnet"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Чаты с AI</CardTitle>
              <CardDescription className="text-gray-400">
                Настройки для 3 видов чатов (универсальный, помощь с сайтом, консультант по рекламе).
                История сохраняется до указанного количества сообщений. AI правила задаются в админке, чат правила задает пользователь.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Включено</Label>
                <Switch
                  checked={config.chats.enabled}
                  onCheckedChange={(checked) => updateConfig('chats.enabled', checked)}
                />
              </div>
              {!config.useGlobalConfig && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">API Key</Label>
                    <Input
                      type="password"
                      value={config.chats.apiKey || ''}
                      onChange={(e) => updateConfig('chats.apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">API URL</Label>
                    <Input
                      value={config.chats.apiUrl || 'https://openrouter.ai/api/v1/chat/completions'}
                      onChange={(e) => updateConfig('chats.apiUrl', e.target.value)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Модель</Label>
                    <Input
                      value={config.chats.model || ''}
                      onChange={(e) => updateConfig('chats.model', e.target.value)}
                      placeholder="anthropic/claude-3.5-sonnet"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label className="text-white">Максимум сообщений в истории</Label>
                <Input
                  type="number"
                  value={config.chats.maxHistoryMessages || 20}
                  onChange={(e) => updateConfig('chats.maxHistoryMessages', Number(e.target.value))}
                  min={1}
                  max={100}
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">AI правила</Label>
                <Textarea
                  value={config.chats.aiRules || ''}
                  onChange={(e) => updateConfig('chats.aiRules', e.target.value)}
                  placeholder="Всегда отвечай вежливо и профессионально..."
                  className="bg-gray-900 border-gray-700 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-rules" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI правила для чатов</CardTitle>
              <CardDescription className="text-gray-400">
                Настройте AI правила для каждого режима чата. Эти правила определяют поведение AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { id: 'universal', name: 'Универсальный', color: 'bg-primary' },
                { id: 'site', name: 'Помощь с сайтом', color: 'bg-secondary' },
                { id: 'ads', name: 'Консультант по рекламе', color: 'bg-orange-500' },
                { id: 'accountant', name: 'Бухгалтер', color: 'bg-green-500' },
              ].map((mode) => {
                const modeKey = mode.id as keyof typeof DEFAULT_AI_RULES;
                const currentRules = config.chatModes?.[modeKey]?.aiRules || DEFAULT_AI_RULES[modeKey] || '';
                const currentTemp = config.chatModes?.[modeKey]?.temperature ?? 0.7;
                const currentMaxTokens = config.chatModes?.[modeKey]?.maxTokens ?? 2000;
                
                return (
                  <div key={mode.id} className="space-y-4 p-4 border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${mode.color}`}></div>
                      <Label className="text-white text-lg font-semibold">{mode.name}</Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">AI правила</Label>
                      <Textarea
                        value={currentRules}
                        onChange={(e) => {
                          setConfig((prev) => {
                            const newChatModes = {
                              ...(prev.chatModes || {}),
                              [modeKey]: {
                                aiRules: e.target.value,
                                temperature: prev.chatModes?.[modeKey]?.temperature ?? 0.7,
                                maxTokens: prev.chatModes?.[modeKey]?.maxTokens ?? 2000,
                              },
                            };
                            return {
                              ...prev,
                              chatModes: newChatModes as AIConfig['chatModes'],
                            };
                          });
                        }}
                        className="bg-gray-900 border-gray-700 min-h-[150px] font-mono text-sm"
                        placeholder={`AI правила для ${mode.name} режима...`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-400">Температура</Label>
                        <Input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={currentTemp}
                          onChange={(e) => {
                            setConfig((prev) => {
                              const newChatModes = {
                                ...(prev.chatModes || {}),
                                [modeKey]: {
                                  aiRules: currentRules,
                                  temperature: parseFloat(e.target.value) || 0.7,
                                  maxTokens: currentMaxTokens,
                                },
                              };
                              return {
                                ...prev,
                                chatModes: newChatModes as AIConfig['chatModes'],
                              };
                            });
                          }}
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-400">Макс. токенов</Label>
                        <Input
                          type="number"
                          min="100"
                          max="4000"
                          step="100"
                          value={currentMaxTokens}
                          onChange={(e) => {
                            setConfig((prev) => {
                              const newChatModes = {
                                ...(prev.chatModes || {}),
                                [modeKey]: {
                                  aiRules: currentRules,
                                  temperature: currentTemp,
                                  maxTokens: parseInt(e.target.value) || 2000,
                                },
                              };
                              return {
                                ...prev,
                                chatModes: newChatModes as AIConfig['chatModes'],
                              };
                            });
                          }}
                          className="bg-gray-900 border-gray-700"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConfig((prev) => {
                          const newChatModes = {
                            ...(prev.chatModes || {}),
                            [modeKey]: {
                              aiRules: DEFAULT_AI_RULES[modeKey],
                              temperature: 0.7,
                              maxTokens: 2000,
                            },
                          };
                          return {
                            ...prev,
                            chatModes: newChatModes as AIConfig['chatModes'],
                          };
                        });
                      }}
                    >
                      <Icon name="RotateCcw" size={14} className="mr-2" />
                      Сбросить к умолчанию
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadConfig}>
          Отмена
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Icon name="Loader2" className="animate-spin mr-2" size={16} />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" className="mr-2" size={16} />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

