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

interface EmailProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface EmailMarketingIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: 'Mail',
    description: 'Email маркетинг',
    features: ['Рассылки', 'Автоматизация', 'Аналитика', 'A/B тесты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'sendpulse',
    name: 'SendPulse',
    icon: 'Mail',
    description: 'Email и SMS',
    features: ['Email', 'SMS', 'Push', 'Чат-боты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'unisender',
    name: 'Unisender',
    icon: 'Mail',
    description: 'Российский email сервис',
    features: ['Рассылки', 'Автоматизация', 'A/B тесты', 'Русский язык'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'getresponse',
    name: 'GetResponse',
    icon: 'Mail',
    description: 'Email маркетинг',
    features: ['Рассылки', 'Автоматизация', 'Лендинги', 'Веб-семинары'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    icon: 'Mail',
    description: 'Транзакционные письма',
    features: ['Транзакции', 'API', 'Аналитика', 'Масштабируемость'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    icon: 'Mail',
    description: 'Email API',
    features: ['API', 'Транзакции', 'Валидация', 'Аналитика'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'amazon-ses',
    name: 'Amazon SES',
    icon: 'Cloud',
    description: 'Email сервис AWS',
    features: ['AWS', 'Масштабируемость', 'Низкая стоимость', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-mail',
    name: 'Yandex Mail',
    icon: 'Mail',
    description: 'Почта от Яндекса',
    features: ['SMTP', 'Русский язык', 'Надежность'],
    isConfigured: false,
    config: {}
  }
];

export const EmailMarketingIntegrations = ({ blockId, onIntegrationChange }: EmailMarketingIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<EmailProvider[]>(EMAIL_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    subscriptions: boolean;
    segmentation: boolean;
    autoEmails: boolean;
    templates: boolean;
    abTesting: boolean;
    openStats: boolean;
    unsubscribe: boolean;
  }>({
    subscriptions: true,
    segmentation: false,
    autoEmails: false,
    templates: false,
    abTesting: false,
    openStats: true,
    unsubscribe: true
  });

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      subscriptions: true,
      segmentation: false,
      autoEmails: false,
      templates: false,
      abTesting: false,
      openStats: true,
      unsubscribe: true
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
      case 'mailchimp':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'xxxx-us1' },
          { key: 'listId', label: 'List ID', type: 'text', required: true, placeholder: 'Список подписчиков' },
          { key: 'serverPrefix', label: 'Server Prefix', type: 'text', required: false, placeholder: 'us1, us2, etc.' }
        ];
      case 'sendpulse':
        return [
          { key: 'userId', label: 'User ID', type: 'text', required: true },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
        ];
      case 'unisender':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'listId', label: 'List ID', type: 'text', required: true }
        ];
      case 'getresponse':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'apiUrl', label: 'API URL', type: 'text', required: true, placeholder: 'https://api3.getresponse.com' }
        ];
      case 'sendgrid':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'fromEmail', label: 'From Email', type: 'text', required: true },
          { key: 'fromName', label: 'From Name', type: 'text', required: false }
        ];
      case 'mailgun':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'mg.yourdomain.com' },
          { key: 'region', label: 'Region', type: 'select', options: ['us', 'eu'], required: true }
        ];
      case 'amazon-ses':
        return [
          { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
          { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
          { key: 'region', label: 'Region', type: 'text', required: true, placeholder: 'us-east-1' },
          { key: 'fromEmail', label: 'From Email', type: 'text', required: true }
        ];
      case 'yandex-mail':
        return [
          { key: 'smtpHost', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.yandex.ru' },
          { key: 'smtpPort', label: 'SMTP Port', type: 'text', required: true, placeholder: '465' },
          { key: 'smtpUser', label: 'SMTP User', type: 'text', required: true },
          { key: 'smtpPassword', label: 'SMTP Password', type: 'password', required: true },
          { key: 'fromEmail', label: 'From Email', type: 'text', required: true }
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

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Функции email маркетинга</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Подписки на рассылки</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая подписка пользователей на рассылки
                  </p>
                </div>
                <Switch
                  checked={features.subscriptions}
                  onCheckedChange={(checked) => handleFeatureChange('subscriptions', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Сегментация подписчиков</Label>
                  <p className="text-xs text-muted-foreground">
                    Разделение подписчиков на группы по интересам
                  </p>
                </div>
                <Switch
                  checked={features.segmentation}
                  onCheckedChange={(checked) => handleFeatureChange('segmentation', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Автоматические письма</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая отправка писем по триггерам
                  </p>
                </div>
                <Switch
                  checked={features.autoEmails}
                  onCheckedChange={(checked) => handleFeatureChange('autoEmails', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email шаблоны</Label>
                  <p className="text-xs text-muted-foreground">
                    Использование готовых шаблонов писем
                  </p>
                </div>
                <Switch
                  checked={features.templates}
                  onCheckedChange={(checked) => handleFeatureChange('templates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">A/B тестирование</Label>
                  <p className="text-xs text-muted-foreground">
                    Тестирование разных вариантов писем
                  </p>
                </div>
                <Switch
                  checked={features.abTesting}
                  onCheckedChange={(checked) => handleFeatureChange('abTesting', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Статистика открытий</Label>
                  <p className="text-xs text-muted-foreground">
                    Отслеживание открытий и кликов по письмам
                  </p>
                </div>
                <Switch
                  checked={features.openStats}
                  onCheckedChange={(checked) => handleFeatureChange('openStats', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отписка от рассылок</Label>
                  <p className="text-xs text-muted-foreground">
                    Возможность отписки от рассылок
                  </p>
                </div>
                <Switch
                  checked={features.unsubscribe}
                  onCheckedChange={(checked) => handleFeatureChange('unsubscribe', checked)}
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
          <Icon name="Mail" size={20} className="text-primary" />
          Email маркетинг
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с email сервисами для рассылок и маркетинга
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

