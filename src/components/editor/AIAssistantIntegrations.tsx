import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AIProvider {
  id: string;
  name: string;
  category: 'ai' | 'chatbot' | 'voice';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface AIAssistantIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT',
    category: 'ai',
    icon: 'Sparkles',
    description: 'ChatGPT интеграция',
    features: ['GPT-4', 'GPT-3.5', 'DALL-E', 'Whisper'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    category: 'ai',
    icon: 'Sparkles',
    description: 'AI ассистент',
    features: ['Claude 3.5', 'Claude 3', 'Длинный контекст'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-bard',
    name: 'Google Bard',
    category: 'ai',
    icon: 'Sparkles',
    description: 'AI от Google',
    features: ['Gemini', 'Поиск', 'Мультимодальность'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-gpt',
    name: 'Yandex GPT',
    category: 'ai',
    icon: 'Sparkles',
    description: 'Российский AI',
    features: ['GPT', 'YaLM', 'Русский язык'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'gigachat',
    name: 'GigaChat',
    category: 'ai',
    icon: 'Sparkles',
    description: 'Российский AI от Сбера',
    features: ['GPT', 'Русский язык', 'Безопасность'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'dialogflow',
    name: 'Dialogflow',
    category: 'chatbot',
    icon: 'MessageCircle',
    description: 'Google чат-боты',
    features: ['NLP', 'Интенты', 'Сущности', 'Мультиязычность'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'microsoft-bot',
    name: 'Microsoft Bot Framework',
    category: 'chatbot',
    icon: 'MessageCircle',
    description: 'Чат-боты',
    features: ['Azure', 'LUIS', 'QnA Maker'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'chatfuel',
    name: 'Chatfuel',
    category: 'chatbot',
    icon: 'MessageCircle',
    description: 'Конструктор ботов',
    features: ['Визуальный редактор', 'Facebook', 'Telegram'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'manychat',
    name: 'ManyChat',
    category: 'chatbot',
    icon: 'MessageCircle',
    description: 'Facebook боты',
    features: ['Facebook', 'Instagram', 'Автоматизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'tilda-chatbots',
    name: 'Tilda Chatbots',
    category: 'chatbot',
    icon: 'MessageCircle',
    description: 'Интеграция с Tilda',
    features: ['Tilda', 'Виджеты', 'Автоматизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-alice',
    name: 'Yandex Alice',
    category: 'voice',
    icon: 'Mic',
    description: 'Голосовой ассистент',
    features: ['Голос', 'Навыки', 'Умный дом'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-assistant',
    name: 'Google Assistant',
    category: 'voice',
    icon: 'Mic',
    description: 'Интеграция',
    features: ['Голос', 'Actions', 'Умный дом'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'amazon-alexa',
    name: 'Amazon Alexa',
    category: 'voice',
    icon: 'Mic',
    description: 'Навыки для Alexa',
    features: ['Голос', 'Skills', 'Умный дом'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'siri',
    name: 'Siri Shortcuts',
    category: 'voice',
    icon: 'Mic',
    description: 'Интеграция с Siri',
    features: ['Голос', 'Shortcuts', 'iOS'],
    isConfigured: false,
    config: {}
  }
];

export const AIAssistantIntegrations = ({ blockId, onIntegrationChange }: AIAssistantIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<AIProvider[]>(AI_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    onlineConsultant: boolean;
    autoReply: boolean;
    requestProcessing: boolean;
    booking: boolean;
    siteSearch: boolean;
    personalization: boolean;
    multilingual: boolean;
  }>({
    onlineConsultant: true,
    autoReply: true,
    requestProcessing: false,
    booking: false,
    siteSearch: false,
    personalization: false,
    multilingual: false
  });

  const handleProviderSelect = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      onlineConsultant: true,
      autoReply: true,
      requestProcessing: false,
      booking: false,
      siteSearch: false,
      personalization: false,
      multilingual: false
    });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureChange = (feature: keyof typeof features, value: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: value }));
    setConfig(prev => ({ ...prev, features: { ...features, [feature]: value } }));
  };

  const handleSave = () => {
    if (!selectedProvider) return;

    const finalConfig = {
      ...config,
      features
    };

    const updatedProviders = providers.map(p => 
      p.id === selectedProvider.id 
        ? { ...p, isConfigured: true, config: finalConfig }
        : p
    );
    setProviders(updatedProviders);

    if (onIntegrationChange) {
      onIntegrationChange(selectedProvider.id, finalConfig);
    }

    toast({
      title: "Интеграция настроена",
      description: `${selectedProvider.name} успешно настроен`
    });
  };

  const handleTest = async () => {
    if (!selectedProvider) return;

    toast({
      title: "Тестирование",
      description: `Проверка подключения к ${selectedProvider.name}...`
    });
  };

  const getConfigFields = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
          { key: 'model', label: 'Модель', type: 'select', options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'], required: true },
          { key: 'temperature', label: 'Temperature', type: 'number', required: false, placeholder: '0.7' },
          { key: 'maxTokens', label: 'Max Tokens', type: 'number', required: false, placeholder: '2000' }
        ];
      case 'claude':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-ant-...' },
          { key: 'model', label: 'Модель', type: 'select', options: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'], required: true },
          { key: 'temperature', label: 'Temperature', type: 'number', required: false, placeholder: '0.7' },
          { key: 'maxTokens', label: 'Max Tokens', type: 'number', required: false, placeholder: '4096' }
        ];
      case 'google-bard':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'model', label: 'Модель', type: 'select', options: ['gemini-pro', 'gemini-pro-vision'], required: true }
        ];
      case 'yandex-gpt':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'folderId', label: 'Folder ID', type: 'text', required: true },
          { key: 'model', label: 'Модель', type: 'select', options: ['yandexgpt', 'yandexgpt-lite'], required: true }
        ];
      case 'gigachat':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'model', label: 'Модель', type: 'select', options: ['GigaChat', 'GigaChat-Pro'], required: true }
        ];
      case 'dialogflow':
        return [
          { key: 'projectId', label: 'Project ID', type: 'text', required: true },
          { key: 'credentials', label: 'Credentials JSON', type: 'textarea', required: true },
          { key: 'language', label: 'Язык', type: 'select', options: ['ru', 'en', 'es', 'fr'], required: true }
        ];
      case 'microsoft-bot':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'appPassword', label: 'App Password', type: 'password', required: true },
          { key: 'endpoint', label: 'Endpoint', type: 'text', required: true }
        ];
      case 'chatfuel':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'botId', label: 'Bot ID', type: 'text', required: true }
        ];
      case 'manychat':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'subscriberId', label: 'Subscriber ID', type: 'text', required: false }
        ];
      case 'yandex-alice':
        return [
          { key: 'skillId', label: 'Skill ID', type: 'text', required: true },
          { key: 'oauthToken', label: 'OAuth Token', type: 'password', required: true }
        ];
      case 'google-assistant':
        return [
          { key: 'projectId', label: 'Project ID', type: 'text', required: true },
          { key: 'credentials', label: 'Credentials JSON', type: 'textarea', required: true }
        ];
      case 'amazon-alexa':
        return [
          { key: 'skillId', label: 'Skill ID', type: 'text', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
        ];
      case 'siri':
        return [
          { key: 'shortcutId', label: 'Shortcut ID', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ];
      default:
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true }
        ];
    }
  };

  const renderConfigForm = () => {
    if (!selectedProvider) return null;

    const fields = getConfigFields(selectedProvider.id);

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name={selectedProvider.icon as any} size={24} className="text-primary" />
            <div>
              <h3 className="font-semibold">{selectedProvider.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedProvider.description}</p>
            </div>
          </div>
          {selectedProvider.isConfigured && (
            <Badge variant="default" className="bg-green-500">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Настроено
            </Badge>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <Label className="mb-2 block">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'text' || field.type === 'password' || field.type === 'number' ? (
                <Input
                  type={field.type}
                  value={(config[field.key] as string) || ''}
                  onChange={(e) => handleConfigChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'textarea' ? (
                <Textarea
                  value={(config[field.key] as string) || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                  rows={4}
                  className="font-mono text-sm"
                />
              ) : field.type === 'select' && field.options ? (
                <Select
                  value={(config[field.key] as string) || field.options[0]}
                  onValueChange={(value) => handleConfigChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          ))}

          {(selectedProvider.category === 'ai' || selectedProvider.category === 'chatbot') && (
            <>
              <Separator />
              <div>
                <Label className="mb-3 block font-semibold">Функции</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Онлайн консультант</Label>
                      <p className="text-xs text-muted-foreground">
                        Виджет консультанта на сайте
                      </p>
                    </div>
                    <Switch
                      checked={features.onlineConsultant}
                      onCheckedChange={(checked) => handleFeatureChange('onlineConsultant', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Автоматические ответы</Label>
                      <p className="text-xs text-muted-foreground">
                        Автоматические ответы на вопросы
                      </p>
                    </div>
                    <Switch
                      checked={features.autoReply}
                      onCheckedChange={(checked) => handleFeatureChange('autoReply', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Обработка заявок</Label>
                      <p className="text-xs text-muted-foreground">
                        Автоматическая обработка заявок
                      </p>
                    </div>
                    <Switch
                      checked={features.requestProcessing}
                      onCheckedChange={(checked) => handleFeatureChange('requestProcessing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Бронирование и запись</Label>
                      <p className="text-xs text-muted-foreground">
                        Автоматическое бронирование времени
                      </p>
                    </div>
                    <Switch
                      checked={features.booking}
                      onCheckedChange={(checked) => handleFeatureChange('booking', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Поиск по сайту</Label>
                      <p className="text-xs text-muted-foreground">
                        AI-поиск по содержимому сайта
                      </p>
                    </div>
                    <Switch
                      checked={features.siteSearch}
                      onCheckedChange={(checked) => handleFeatureChange('siteSearch', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Персонализация контента</Label>
                      <p className="text-xs text-muted-foreground">
                        Персонализация контента для пользователей
                      </p>
                    </div>
                    <Switch
                      checked={features.personalization}
                      onCheckedChange={(checked) => handleFeatureChange('personalization', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Мультиязычность</Label>
                      <p className="text-xs text-muted-foreground">
                        Поддержка нескольких языков
                      </p>
                    </div>
                    <Switch
                      checked={features.multilingual}
                      onCheckedChange={(checked) => handleFeatureChange('multilingual', checked)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <Icon name="TestTube" size={16} className="mr-2" />
            Тест
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="Sparkles" size={20} className="text-primary" />
          Виртуальные ассистенты и чат-боты
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с AI ассистентами, чат-ботами и голосовыми ассистентами
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai">AI ассистенты</TabsTrigger>
          <TabsTrigger value="chatbot">Чат-боты</TabsTrigger>
          <TabsTrigger value="voice">Голосовые</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'ai').map(provider => (
              <Card
                key={provider.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon name={provider.icon as any} size={24} className="text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {provider.isConfigured && (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      <Icon name="CheckCircle" size={12} />
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'chatbot').map(provider => (
              <Card
                key={provider.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon name={provider.icon as any} size={24} className="text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {provider.isConfigured && (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      <Icon name="CheckCircle" size={12} />
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'voice').map(provider => (
              <Card
                key={provider.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon name={provider.icon as any} size={24} className="text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {provider.isConfigured && (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      <Icon name="CheckCircle" size={12} />
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedProvider && (
        <div className="mt-6">
          {renderConfigForm()}
        </div>
      )}
    </div>
  );
};

