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
import { useToast } from '@/hooks/use-toast';

interface MessengerProvider {
  id: string;
  name: string;
  category: 'popular' | 'other';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface MessengerIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const MESSENGER_PROVIDERS: MessengerProvider[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'popular',
    icon: 'Send',
    description: 'Bot API, Widget, Notifications, Forms, Payments',
    features: ['Bot API', 'Widget', 'Notifications', 'Forms', 'Payments'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'popular',
    icon: 'MessageCircle',
    description: 'Business API, Widget, Notifications, Forms',
    features: ['Business API', 'Widget', 'Notifications', 'Forms'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'viber',
    name: 'Viber',
    category: 'popular',
    icon: 'MessageCircle',
    description: 'Bot, Widget, Notifications',
    features: ['Bot', 'Widget', 'Notifications'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    category: 'other',
    icon: 'MessageCircle',
    description: 'Чат виджет',
    features: ['Chat Widget', 'Notifications'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'vk',
    name: 'VK Messenger',
    category: 'other',
    icon: 'Share2',
    description: 'Интеграция с VK',
    features: ['Messenger', 'Notifications'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'other',
    icon: 'MessageCircle',
    description: 'Интеграция с Discord',
    features: ['Webhooks', 'Bots', 'Notifications'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'other',
    icon: 'MessageSquare',
    description: 'Уведомления и интеграции',
    features: ['Webhooks', 'Notifications', 'Channels'],
    isConfigured: false,
    config: {}
  }
];

export const MessengerIntegrations = ({ blockId, onIntegrationChange }: MessengerIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<MessengerProvider[]>(MESSENGER_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<MessengerProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    bot: boolean;
    widget: boolean;
    notifications: boolean;
    forms: boolean;
    payments: boolean;
    autoReply: boolean;
    forwardMessages: boolean;
    history: boolean;
  }>({
    bot: false,
    widget: false,
    notifications: true,
    forms: true,
    payments: false,
    autoReply: false,
    forwardMessages: false,
    history: false
  });

  const handleProviderSelect = (provider: MessengerProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      bot: false,
      widget: false,
      notifications: true,
      forms: true,
      payments: false,
      autoReply: false,
      forwardMessages: false,
      history: false
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
      case 'telegram':
        return [
          { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz' },
          { key: 'chatId', label: 'Chat ID', type: 'text', required: false, placeholder: 'Для уведомлений' },
          { key: 'widgetId', label: 'Widget ID', type: 'text', required: false, placeholder: 'Для виджета чата' }
        ];
      case 'whatsapp':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
          { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: false },
          { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password', required: false }
        ];
      case 'viber':
        return [
          { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
          { key: 'botName', label: 'Bot Name', type: 'text', required: true }
        ];
      case 'facebook':
        return [
          { key: 'pageId', label: 'Page ID', type: 'text', required: true },
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
          { key: 'pageAccessToken', label: 'Page Access Token', type: 'password', required: true }
        ];
      case 'vk':
        return [
          { key: 'groupId', label: 'Group ID', type: 'text', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: false }
        ];
      case 'discord':
        return [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://discord.com/api/webhooks/...' },
          { key: 'botToken', label: 'Bot Token', type: 'password', required: false },
          { key: 'channelId', label: 'Channel ID', type: 'text', required: false }
        ];
      case 'slack':
        return [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hooks.slack.com/services/...' },
          { key: 'botToken', label: 'Bot Token', type: 'password', required: false },
          { key: 'channel', label: 'Channel', type: 'text', required: false, placeholder: '#general' }
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
            <Label className="mb-3 block font-semibold">Функции</Label>
            <div className="space-y-3">
              {selectedProvider.id === 'telegram' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Bot API</Label>
                      <p className="text-xs text-muted-foreground">
                        Создание и управление ботом
                      </p>
                    </div>
                    <Switch
                      checked={features.bot}
                      onCheckedChange={(checked) => handleFeatureChange('bot', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Widget</Label>
                      <p className="text-xs text-muted-foreground">
                        Виджет чата на сайте
                      </p>
                    </div>
                    <Switch
                      checked={features.widget}
                      onCheckedChange={(checked) => handleFeatureChange('widget', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Payments</Label>
                      <p className="text-xs text-muted-foreground">
                        Платежи через Telegram
                      </p>
                    </div>
                    <Switch
                      checked={features.payments}
                      onCheckedChange={(checked) => handleFeatureChange('payments', checked)}
                    />
                  </div>
                </>
              )}
              {(selectedProvider.id === 'whatsapp' || selectedProvider.id === 'viber') && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Widget</Label>
                    <p className="text-xs text-muted-foreground">
                      Виджет чата на сайте
                    </p>
                  </div>
                  <Switch
                    checked={features.widget}
                    onCheckedChange={(checked) => handleFeatureChange('widget', checked)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Уведомления</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка уведомлений о новых заявках
                  </p>
                </div>
                <Switch
                  checked={features.notifications}
                  onCheckedChange={(checked) => handleFeatureChange('notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отправка форм</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая отправка данных форм
                  </p>
                </div>
                <Switch
                  checked={features.forms}
                  onCheckedChange={(checked) => handleFeatureChange('forms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Автоматические ответы</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая обработка сообщений
                  </p>
                </div>
                <Switch
                  checked={features.autoReply}
                  onCheckedChange={(checked) => handleFeatureChange('autoReply', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Пересылка сообщений</Label>
                  <p className="text-xs text-muted-foreground">
                    Пересылка сообщений в другие каналы
                  </p>
                </div>
                <Switch
                  checked={features.forwardMessages}
                  onCheckedChange={(checked) => handleFeatureChange('forwardMessages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">История переписки</Label>
                  <p className="text-xs text-muted-foreground">
                    Сохранение истории сообщений
                  </p>
                </div>
                <Switch
                  checked={features.history}
                  onCheckedChange={(checked) => handleFeatureChange('history', checked)}
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
          <Icon name="MessageCircle" size={20} className="text-primary" />
          Мессенджеры и коммуникации
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с мессенджерами для коммуникации с клиентами
        </p>
      </div>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="popular">Популярные</TabsTrigger>
          <TabsTrigger value="other">Другие</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'popular').map(provider => (
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

        <TabsContent value="other" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'other').map(provider => (
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

