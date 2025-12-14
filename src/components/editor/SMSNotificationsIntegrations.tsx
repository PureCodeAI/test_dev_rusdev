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

interface NotificationProvider {
  id: string;
  name: string;
  category: 'sms' | 'push';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface SMSNotificationsIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const NOTIFICATION_PROVIDERS: NotificationProvider[] = [
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'sms',
    icon: 'Phone',
    description: 'SMS и звонки',
    features: ['SMS', 'Звонки', 'WhatsApp', 'Глобально'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'smsru',
    name: 'SMS.ru',
    category: 'sms',
    icon: 'MessageSquare',
    description: 'Российский SMS сервис',
    features: ['SMS', 'Viber', 'Русский язык'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'smsaero',
    name: 'SMSAero',
    category: 'sms',
    icon: 'MessageSquare',
    description: 'SMS рассылки',
    features: ['SMS', 'Рассылки', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'smscru',
    name: 'SMSC.ru',
    category: 'sms',
    icon: 'MessageSquare',
    description: 'SMS шлюз',
    features: ['SMS', 'API', 'Viber'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'turbosms',
    name: 'Turbosms',
    category: 'sms',
    icon: 'MessageSquare',
    description: 'SMS сервис',
    features: ['SMS', 'API', 'Рассылки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'onesignal',
    name: 'OneSignal',
    category: 'push',
    icon: 'Bell',
    description: 'Web push',
    features: ['Web Push', 'Mobile Push', 'Email', 'SMS'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'firebase-fcm',
    name: 'Firebase Cloud Messaging',
    category: 'push',
    icon: 'Bell',
    description: 'Push от Google',
    features: ['Push', 'Android', 'iOS', 'Web'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'pusher',
    name: 'Pusher',
    category: 'push',
    icon: 'Bell',
    description: 'Real-time уведомления',
    features: ['Real-time', 'WebSocket', 'Channels'],
    isConfigured: false,
    config: {}
  }
];

export const SMSNotificationsIntegrations = ({ blockId, onIntegrationChange }: SMSNotificationsIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<NotificationProvider[]>(NOTIFICATION_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<NotificationProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    smsOnRegister: boolean;
    smsOnOrder: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
    telegramNotifications: boolean;
  }>({
    smsOnRegister: false,
    smsOnOrder: false,
    pushNotifications: true,
    emailNotifications: true,
    telegramNotifications: false
  });

  const handleProviderSelect = (provider: NotificationProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      smsOnRegister: false,
      smsOnOrder: false,
      pushNotifications: true,
      emailNotifications: true,
      telegramNotifications: false
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
      case 'twilio':
        return [
          { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
          { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
          { key: 'phoneNumber', label: 'Phone Number', type: 'text', required: true, placeholder: '+1234567890' }
        ];
      case 'smsru':
        return [
          { key: 'apiId', label: 'API ID', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false },
          { key: 'sender', label: 'Sender', type: 'text', required: false, placeholder: 'Имя отправителя' }
        ];
      case 'smsaero':
        return [
          { key: 'email', label: 'Email', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'sign', label: 'Подпись', type: 'text', required: false }
        ];
      case 'smscru':
        return [
          { key: 'login', label: 'Login', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'sender', label: 'Sender', type: 'text', required: false }
        ];
      case 'turbosms':
        return [
          { key: 'login', label: 'Login', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'sender', label: 'Sender', type: 'text', required: false }
        ];
      case 'onesignal':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'restApiKey', label: 'REST API Key', type: 'password', required: true },
          { key: 'safariWebId', label: 'Safari Web ID', type: 'text', required: false }
        ];
      case 'firebase-fcm':
        return [
          { key: 'serverKey', label: 'Server Key', type: 'password', required: true },
          { key: 'senderId', label: 'Sender ID', type: 'text', required: true },
          { key: 'projectId', label: 'Project ID', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false }
        ];
      case 'pusher':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'key', label: 'Key', type: 'text', required: true },
          { key: 'secret', label: 'Secret', type: 'password', required: true },
          { key: 'cluster', label: 'Cluster', type: 'text', required: true, placeholder: 'eu, us, etc.' }
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
            <Label className="mb-3 block font-semibold">Триггеры уведомлений</Label>
            <div className="space-y-3">
              {selectedProvider.category === 'sms' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">SMS при регистрации</Label>
                      <p className="text-xs text-muted-foreground">
                        Отправка SMS при регистрации нового пользователя
                      </p>
                    </div>
                    <Switch
                      checked={features.smsOnRegister}
                      onCheckedChange={(checked) => handleFeatureChange('smsOnRegister', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">SMS при заказе</Label>
                      <p className="text-xs text-muted-foreground">
                        Отправка SMS при оформлении заказа
                      </p>
                    </div>
                    <Switch
                      checked={features.smsOnOrder}
                      onCheckedChange={(checked) => handleFeatureChange('smsOnOrder', checked)}
                    />
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push уведомления</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка push уведомлений в браузер или мобильное приложение
                  </p>
                </div>
                <Switch
                  checked={features.pushNotifications}
                  onCheckedChange={(checked) => handleFeatureChange('pushNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email уведомления</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка уведомлений на email
                  </p>
                </div>
                <Switch
                  checked={features.emailNotifications}
                  onCheckedChange={(checked) => handleFeatureChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Telegram уведомления</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка уведомлений в Telegram
                  </p>
                </div>
                <Switch
                  checked={features.telegramNotifications}
                  onCheckedChange={(checked) => handleFeatureChange('telegramNotifications', checked)}
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
          <Icon name="Bell" size={20} className="text-primary" />
          SMS и уведомления
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с SMS сервисами и push уведомлениями
        </p>
      </div>

      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'sms').map(provider => (
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

        <TabsContent value="push" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'push').map(provider => (
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

