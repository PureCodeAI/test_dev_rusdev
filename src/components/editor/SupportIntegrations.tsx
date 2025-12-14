import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface SupportProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface SupportIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const SUPPORT_PROVIDERS: SupportProvider[] = [
  {
    id: 'zendesk',
    name: 'Zendesk',
    icon: 'Headphones',
    description: 'Система поддержки',
    features: ['Тикеты', 'Чат', 'База знаний', 'Аналитика'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    icon: 'Headphones',
    description: 'Тикет-система',
    features: ['Тикеты', 'Чат', 'FAQ', 'Автоматизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'intercom',
    name: 'Intercom',
    icon: 'MessageCircle',
    description: 'Поддержка и продажи',
    features: ['Чат', 'Боты', 'Email', 'Продажи'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'helpscout',
    name: 'Help Scout',
    icon: 'Mail',
    description: 'Email поддержка',
    features: ['Email', 'Тикеты', 'База знаний', 'Команды'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'crisp',
    name: 'Crisp',
    icon: 'MessageCircle',
    description: 'Чат поддержка',
    features: ['Чат', 'Email', 'Боты', 'Аналитика'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'tawk',
    name: 'Tawk.to',
    icon: 'MessageCircle',
    description: 'Бесплатный чат',
    features: ['Чат', 'Бесплатно', 'Мобильное приложение'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'jivo',
    name: 'JivoSite',
    icon: 'MessageCircle',
    description: 'Мультиканальная поддержка',
    features: ['Чат', 'Телефония', 'Email', 'Соцсети'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'custom',
    name: 'Онлайн-чат',
    icon: 'MessageCircle',
    description: 'Собственная система',
    features: ['Чат', 'Кастомизация', 'Интеграции'],
    isConfigured: false,
    config: {}
  }
];

export const SupportIntegrations = ({ blockId, onIntegrationChange }: SupportIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<SupportProvider[]>(SUPPORT_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<SupportProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    createTickets: boolean;
    redirectToSupport: boolean;
    history: boolean;
    knowledgeBase: boolean;
    liveChat: boolean;
    videoCalls: boolean;
    screenshots: boolean;
    rating: boolean;
  }>({
    createTickets: true,
    redirectToSupport: true,
    history: true,
    knowledgeBase: false,
    liveChat: true,
    videoCalls: false,
    screenshots: true,
    rating: false
  });

  const handleProviderSelect = (provider: SupportProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      createTickets: true,
      redirectToSupport: true,
      history: true,
      knowledgeBase: false,
      liveChat: true,
      videoCalls: false,
      screenshots: true,
      rating: false
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
      description: `${selectedProvider.name} успешно настроена`
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
      case 'zendesk':
        return [
          { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'your-domain' },
          { key: 'email', label: 'Email', type: 'text', required: true },
          { key: 'apiToken', label: 'API Token', type: 'password', required: true },
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: false }
        ];
      case 'freshdesk':
        return [
          { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'your-domain.freshdesk.com' },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ];
      case 'intercom':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
        ];
      case 'helpscout':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'mailboxId', label: 'Mailbox ID', type: 'text', required: true }
        ];
      case 'crisp':
        return [
          { key: 'websiteId', label: 'Website ID', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'apiIdentifier', label: 'API Identifier', type: 'text', required: true }
        ];
      case 'tawk':
        return [
          { key: 'propertyId', label: 'Property ID', type: 'text', required: true },
          { key: 'widgetId', label: 'Widget ID', type: 'text', required: true }
        ];
      case 'jivo':
        return [
          { key: 'widgetId', label: 'Widget ID', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ];
      case 'custom':
        return [
          { key: 'chatWidgetUrl', label: 'Chat Widget URL', type: 'text', required: true, placeholder: 'https://your-chat-widget.com' },
          { key: 'apiEndpoint', label: 'API Endpoint', type: 'text', required: true, placeholder: 'https://api.example.com/chat' },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false }
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
              {field.type === 'text' || field.type === 'password' ? (
                <Input
                  type={field.type}
                  value={(config[field.key] as string) || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                />
              ) : null}
            </div>
          ))}

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Функции поддержки</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Создание тикетов из форм</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматически создавать тикеты при отправке форм
                  </p>
                </div>
                <Switch
                  checked={features.createTickets}
                  onCheckedChange={(checked) => handleFeatureChange('createTickets', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Переадресация в поддержку</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая переадресация запросов в поддержку
                  </p>
                </div>
                <Switch
                  checked={features.redirectToSupport}
                  onCheckedChange={(checked) => handleFeatureChange('redirectToSupport', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">История обращений</Label>
                  <p className="text-xs text-muted-foreground">
                    Сохранение истории всех обращений
                  </p>
                </div>
                <Switch
                  checked={features.history}
                  onCheckedChange={(checked) => handleFeatureChange('history', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">База знаний (FAQ)</Label>
                  <p className="text-xs text-muted-foreground">
                    Интеграция с базой знаний для быстрых ответов
                  </p>
                </div>
                <Switch
                  checked={features.knowledgeBase}
                  onCheckedChange={(checked) => handleFeatureChange('knowledgeBase', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Живой чат</Label>
                  <p className="text-xs text-muted-foreground">
                    Виджет живого чата на сайте
                  </p>
                </div>
                <Switch
                  checked={features.liveChat}
                  onCheckedChange={(checked) => handleFeatureChange('liveChat', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Видео-звонки</Label>
                  <p className="text-xs text-muted-foreground">
                    Возможность видеозвонков с поддержкой
                  </p>
                </div>
                <Switch
                  checked={features.videoCalls}
                  onCheckedChange={(checked) => handleFeatureChange('videoCalls', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Скриншоты и файлы</Label>
                  <p className="text-xs text-muted-foreground">
                    Возможность отправки скриншотов и файлов
                  </p>
                </div>
                <Switch
                  checked={features.screenshots}
                  onCheckedChange={(checked) => handleFeatureChange('screenshots', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Рейтинг поддержки</Label>
                  <p className="text-xs text-muted-foreground">
                    Сбор оценок качества поддержки
                  </p>
                </div>
                <Switch
                  checked={features.rating}
                  onCheckedChange={(checked) => handleFeatureChange('rating', checked)}
                />
              </div>
            </div>
          </div>
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
          <Icon name="Headphones" size={20} className="text-primary" />
          Системы поддержки
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с системами поддержки для работы с клиентами
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map(provider => (
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

      {selectedProvider && (
        <div className="mt-6">
          {renderConfigForm()}
        </div>
      )}
    </div>
  );
};

