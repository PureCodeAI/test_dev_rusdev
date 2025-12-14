import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsProvider {
  id: string;
  name: string;
  category: 'analytics' | 'pixel' | 'tag-manager';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface AnalyticsIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const ANALYTICS_PROVIDERS: AnalyticsProvider[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'analytics',
    icon: 'BarChart',
    description: 'Полная аналитика',
    features: ['События', 'Конверсии', 'E-commerce', 'Отчеты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-metrika',
    name: 'Яндекс Метрика',
    category: 'analytics',
    icon: 'LineChart',
    description: 'Российская аналитика',
    features: ['Вебвизор', 'Карта кликов', 'Тепловые карты', 'Отчеты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    icon: 'TrendingUp',
    description: 'Продуктовая аналитика',
    features: ['События', 'Когорты', 'Funnels', 'Retention'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    category: 'analytics',
    icon: 'Activity',
    description: 'Поведенческая аналитика',
    features: ['События', 'User Journey', 'Сегментация', 'A/B тесты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    category: 'analytics',
    icon: 'Thermometer',
    description: 'Тепловые карты и записи',
    features: ['Тепловые карты', 'Записи сессий', 'Опросы', 'Feedback'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'microsoft-clarity',
    name: 'Microsoft Clarity',
    category: 'analytics',
    icon: 'Eye',
    description: 'Бесплатная аналитика',
    features: ['Тепловые карты', 'Записи', 'Insights', 'Бесплатно'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    category: 'pixel',
    icon: 'Facebook',
    description: 'Отслеживание конверсий',
    features: ['Конверсии', 'Ретаргетинг', 'Lookalike', 'Оптимизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'tiktok-pixel',
    name: 'TikTok Pixel',
    category: 'pixel',
    icon: 'Video',
    description: 'Отслеживание TikTok',
    features: ['События', 'Конверсии', 'Ретаргетинг', 'Оптимизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'vk-pixel',
    name: 'VK Pixel',
    category: 'pixel',
    icon: 'Share2',
    description: 'Отслеживание VK',
    features: ['События', 'Конверсии', 'Ретаргетинг', 'Аудитории'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    category: 'pixel',
    icon: 'DollarSign',
    description: 'Реклама Google',
    features: ['Конверсии', 'Ретаргетинг', 'Smart Bidding', 'Аудитории'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-direct',
    name: 'Яндекс Директ',
    category: 'pixel',
    icon: 'Target',
    description: 'Реклама Яндекс',
    features: ['Конверсии', 'Ретаргетинг', 'Аудитории', 'Отчеты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-tag-manager',
    name: 'Google Tag Manager',
    category: 'tag-manager',
    icon: 'Settings',
    description: 'Управление тегами',
    features: ['Теги', 'Триггеры', 'Переменные', 'Версионирование'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'tealium',
    name: 'Tealium',
    category: 'tag-manager',
    icon: 'Layers',
    description: 'Tag менеджер',
    features: ['Теги', 'Data Layer', 'API', 'Интеграции'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'segment',
    name: 'Segment',
    category: 'tag-manager',
    icon: 'Network',
    description: 'Customer data platform',
    features: ['События', 'Destinations', 'Warehouses', 'Personas'],
    isConfigured: false,
    config: {}
  }
];

export const AnalyticsIntegrations = ({ blockId, onIntegrationChange }: AnalyticsIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<AnalyticsProvider[]>(ANALYTICS_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<AnalyticsProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    trackPageViews: boolean;
    trackEvents: boolean;
    trackConversions: boolean;
    trackEcommerce: boolean;
    retargeting: boolean;
  }>({
    trackPageViews: true,
    trackEvents: true,
    trackConversions: false,
    trackEcommerce: false,
    retargeting: false
  });

  const handleProviderSelect = (provider: AnalyticsProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      trackPageViews: true,
      trackEvents: true,
      trackConversions: false,
      trackEcommerce: false,
      retargeting: false
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
      case 'google-analytics':
        return [
          { key: 'measurementId', label: 'Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
          { key: 'trackingId', label: 'Tracking ID (опционально)', type: 'text', required: false, placeholder: 'UA-XXXXXXXXX-X' }
        ];
      case 'yandex-metrika':
        return [
          { key: 'counterId', label: 'Counter ID', type: 'text', required: true, placeholder: '12345678' },
          { key: 'clickmap', label: 'Карта кликов', type: 'checkbox', required: false },
          { key: 'webvisor', label: 'Вебвизор', type: 'checkbox', required: false }
        ];
      case 'mixpanel':
        return [
          { key: 'projectToken', label: 'Project Token', type: 'password', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: false }
        ];
      case 'amplitude':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: false }
        ];
      case 'hotjar':
        return [
          { key: 'siteId', label: 'Site ID', type: 'text', required: true, placeholder: '1234567' }
        ];
      case 'microsoft-clarity':
        return [
          { key: 'projectId', label: 'Project ID', type: 'text', required: true, placeholder: 'xxxxxxxxxx' }
        ];
      case 'facebook-pixel':
        return [
          { key: 'pixelId', label: 'Pixel ID', type: 'text', required: true, placeholder: '123456789012345' },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'tiktok-pixel':
        return [
          { key: 'pixelId', label: 'Pixel ID', type: 'text', required: true, placeholder: 'CXXXXXXXXXXXXXXX' },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'vk-pixel':
        return [
          { key: 'pixelId', label: 'Pixel ID', type: 'text', required: true, placeholder: 'VK-RTRG-123456-ABCD' },
          { key: 'accountId', label: 'Account ID', type: 'text', required: false }
        ];
      case 'google-ads':
        return [
          { key: 'conversionId', label: 'Conversion ID', type: 'text', required: true, placeholder: 'AW-123456789' },
          { key: 'conversionLabel', label: 'Conversion Label', type: 'text', required: false }
        ];
      case 'yandex-direct':
        return [
          { key: 'counterId', label: 'Counter ID', type: 'text', required: true, placeholder: '12345678' },
          { key: 'goalId', label: 'Goal ID', type: 'text', required: false }
        ];
      case 'google-tag-manager':
        return [
          { key: 'containerId', label: 'Container ID', type: 'text', required: true, placeholder: 'GTM-XXXXXXX' }
        ];
      case 'tealium':
        return [
          { key: 'account', label: 'Account', type: 'text', required: true },
          { key: 'profile', label: 'Profile', type: 'text', required: true },
          { key: 'environment', label: 'Environment', type: 'text', required: true, placeholder: 'dev, qa, prod' }
        ];
      case 'segment':
        return [
          { key: 'writeKey', label: 'Write Key', type: 'password', required: true },
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
              ) : field.type === 'checkbox' ? (
                <Switch
                  checked={(config[field.key] as boolean) || false}
                  onCheckedChange={(checked) => handleConfigChange(field.key, checked)}
                />
              ) : null}
            </div>
          ))}

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Функции отслеживания</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отслеживание просмотров страниц</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическое отслеживание просмотров страниц
                  </p>
                </div>
                <Switch
                  checked={features.trackPageViews}
                  onCheckedChange={(checked) => handleFeatureChange('trackPageViews', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отслеживание событий</Label>
                  <p className="text-xs text-muted-foreground">
                    Отслеживание пользовательских событий
                  </p>
                </div>
                <Switch
                  checked={features.trackEvents}
                  onCheckedChange={(checked) => handleFeatureChange('trackEvents', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отслеживание конверсий</Label>
                  <p className="text-xs text-muted-foreground">
                    Отслеживание целевых действий пользователей
                  </p>
                </div>
                <Switch
                  checked={features.trackConversions}
                  onCheckedChange={(checked) => handleFeatureChange('trackConversions', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">E-commerce отслеживание</Label>
                  <p className="text-xs text-muted-foreground">
                    Отслеживание покупок и транзакций
                  </p>
                </div>
                <Switch
                  checked={features.trackEcommerce}
                  onCheckedChange={(checked) => handleFeatureChange('trackEcommerce', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ретаргетинг</Label>
                  <p className="text-xs text-muted-foreground">
                    Создание аудиторий для ретаргетинга
                  </p>
                </div>
                <Switch
                  checked={features.retargeting}
                  onCheckedChange={(checked) => handleFeatureChange('retargeting', checked)}
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
          <Icon name="BarChart" size={20} className="text-primary" />
          Аналитика и отслеживание
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с аналитикой, пикселями и tag менеджерами
        </p>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="pixels">Пиксели</TabsTrigger>
          <TabsTrigger value="tag-managers">Tag менеджеры</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.filter(p => p.category === 'analytics').map(provider => (
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
                        {provider.features.slice(0, 2).map((feature, idx) => (
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

        <TabsContent value="pixels" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.filter(p => p.category === 'pixel').map(provider => (
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
                        {provider.features.slice(0, 2).map((feature, idx) => (
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

        <TabsContent value="tag-managers" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.filter(p => p.category === 'tag-manager').map(provider => (
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
                        {provider.features.slice(0, 2).map((feature, idx) => (
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

