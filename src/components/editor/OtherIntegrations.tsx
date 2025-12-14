import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface OtherProvider {
  id: string;
  name: string;
  category: 'weather' | 'maps' | 'translate' | 'currency' | 'documents' | 'automation';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface OtherIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const OTHER_PROVIDERS: OtherProvider[] = [
  {
    id: 'weather-widget',
    name: 'Погодные виджеты',
    category: 'weather',
    icon: 'Cloud',
    description: 'Виджеты погоды',
    features: ['Виджет', 'API', 'Прогноз', 'Многоязычность'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'timezone',
    name: 'Часовые пояса',
    category: 'weather',
    icon: 'Clock',
    description: 'Управление часовыми поясами',
    features: ['Автоопределение', 'Выбор', 'Формат'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    category: 'maps',
    icon: 'MapPin',
    description: 'Карты Google',
    features: ['Карты', 'Маршруты', 'Поиск', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-maps',
    name: 'Яндекс Карты',
    category: 'maps',
    icon: 'MapPin',
    description: 'Карты Яндекс',
    features: ['Карты', 'Маршруты', 'Поиск', 'Русский'],
    isConfigured: false,
    config: {}
  },
  {
    id: '2gis',
    name: '2GIS',
    category: 'maps',
    icon: 'MapPin',
    description: 'Карты 2GIS',
    features: ['Карты', 'Маршруты', 'Поиск', 'Россия'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    category: 'maps',
    icon: 'MapPin',
    description: 'Открытые карты',
    features: ['Карты', 'Бесплатно', 'Open Source'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-translate',
    name: 'Google Translate',
    category: 'translate',
    icon: 'Languages',
    description: 'Переводчик Google',
    features: ['Перевод', '100+ языков', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-translate',
    name: 'Yandex Translate',
    category: 'translate',
    icon: 'Languages',
    description: 'Переводчик Яндекс',
    features: ['Перевод', '90+ языков', 'Русский'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'deepl',
    name: 'DeepL',
    category: 'translate',
    icon: 'Languages',
    description: 'Качественный перевод',
    features: ['Перевод', 'Высокое качество', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'currency-converter',
    name: 'Конвертер валют',
    category: 'currency',
    icon: 'DollarSign',
    description: 'Конвертация валют',
    features: ['Конвертация', 'Курсы', 'Обновление'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'exchange-rates',
    name: 'Курсы валют',
    category: 'currency',
    icon: 'TrendingUp',
    description: 'Актуальные курсы',
    features: ['Курсы', 'Обновление', 'История'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'multi-currency',
    name: 'Мультивалютность',
    category: 'currency',
    icon: 'Coins',
    description: 'Поддержка валют',
    features: ['Валюты', 'Автоопределение', 'Переключение'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    category: 'documents',
    icon: 'FileText',
    description: 'Документы Google',
    features: ['Документы', 'Совместная работа', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'pdf-generation',
    name: 'PDF генерация',
    category: 'documents',
    icon: 'FileText',
    description: 'Создание PDF',
    features: ['PDF', 'Шаблоны', 'Автоматизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'document-workflow',
    name: 'Документооборот',
    category: 'documents',
    icon: 'FileCheck',
    description: 'Управление документами',
    features: ['Документы', 'Подписи', 'Workflow'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    icon: 'Zap',
    description: 'Автоматизация',
    features: ['Интеграции', 'Триггеры', 'Действия'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    category: 'automation',
    icon: 'Zap',
    description: 'Автоматизация',
    features: ['Интеграции', 'Визуальный редактор', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'automation',
    icon: 'Zap',
    description: 'Автоматизация',
    features: ['Интеграции', 'Open Source', 'Self-hosted'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    category: 'automation',
    icon: 'Zap',
    description: 'Автоматизация',
    features: ['Интеграции', 'Applets', 'Простота'],
    isConfigured: false,
    config: {}
  }
];

export const OtherIntegrations = ({ blockId, onIntegrationChange }: OtherIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<OtherProvider[]>(OTHER_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<OtherProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});

  const handleProviderSelect = (provider: OtherProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!selectedProvider) return;

    const updatedProviders = providers.map(p => 
      p.id === selectedProvider.id 
        ? { ...p, isConfigured: true, config }
        : p
    );
    setProviders(updatedProviders);

    if (onIntegrationChange) {
      onIntegrationChange(selectedProvider.id, config);
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
      case 'weather-widget':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'city', label: 'Город по умолчанию', type: 'text', required: false },
          { key: 'units', label: 'Единицы измерения', type: 'select', required: false, options: ['metric', 'imperial'] }
        ];
      case 'timezone':
        return [
          { key: 'defaultTimezone', label: 'Часовой пояс по умолчанию', type: 'text', required: false, placeholder: 'UTC' },
          { key: 'autoDetect', label: 'Автоопределение', type: 'checkbox', required: false }
        ];
      case 'google-maps':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'defaultLocation', label: 'Местоположение по умолчанию', type: 'text', required: false }
        ];
      case 'yandex-maps':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'defaultLocation', label: 'Местоположение по умолчанию', type: 'text', required: false }
        ];
      case '2gis':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'city', label: 'Город', type: 'text', required: false }
        ];
      case 'openstreetmap':
        return [
          { key: 'tileServer', label: 'Tile Server', type: 'text', required: false, placeholder: 'https://tile.openstreetmap.org' }
        ];
      case 'google-translate':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'sourceLanguage', label: 'Язык источника', type: 'text', required: false },
          { key: 'targetLanguage', label: 'Язык перевода', type: 'text', required: false }
        ];
      case 'yandex-translate':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'sourceLanguage', label: 'Язык источника', type: 'text', required: false },
          { key: 'targetLanguage', label: 'Язык перевода', type: 'text', required: false }
        ];
      case 'deepl':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'sourceLanguage', label: 'Язык источника', type: 'text', required: false },
          { key: 'targetLanguage', label: 'Язык перевода', type: 'text', required: false }
        ];
      case 'currency-converter':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: false },
          { key: 'baseCurrency', label: 'Базовая валюта', type: 'text', required: false, placeholder: 'USD' },
          { key: 'updateInterval', label: 'Интервал обновления (минуты)', type: 'number', required: false }
        ];
      case 'exchange-rates':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: false },
          { key: 'provider', label: 'Провайдер', type: 'select', required: false, options: ['exchangerate-api', 'fixer', 'currencylayer'] }
        ];
      case 'multi-currency':
        return [
          { key: 'supportedCurrencies', label: 'Поддерживаемые валюты', type: 'text', required: false, placeholder: 'USD, EUR, RUB' },
          { key: 'defaultCurrency', label: 'Валюта по умолчанию', type: 'text', required: false, placeholder: 'USD' }
        ];
      case 'google-docs':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'pdf-generation':
        return [
          { key: 'templatePath', label: 'Путь к шаблону', type: 'text', required: false },
          { key: 'outputFormat', label: 'Формат вывода', type: 'select', required: false, options: ['A4', 'Letter'] }
        ];
      case 'document-workflow':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'workflowEnabled', label: 'Workflow включен', type: 'checkbox', required: false }
        ];
      case 'zapier':
        return [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hooks.zapier.com/...' }
        ];
      case 'make':
        return [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hook.integromat.com/...' }
        ];
      case 'n8n':
        return [
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://your-n8n.com/webhook/...' },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false }
        ];
      case 'ifttt':
        return [
          { key: 'webhookKey', label: 'Webhook Key', type: 'password', required: true },
          { key: 'eventName', label: 'Event Name', type: 'text', required: false }
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
                  onChange={(e) => handleConfigChange(field.key, field.type === 'number' ? parseInt(e.target.value) : e.target.value)}
                  placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={(config[field.key] as string) || ''}
                  onValueChange={(v) => handleConfigChange(field.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Выберите ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'checkbox' ? (
                <Switch
                  checked={(config[field.key] as boolean) || false}
                  onCheckedChange={(checked) => handleConfigChange(field.key, checked)}
                />
              ) : null}
            </div>
          ))}
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

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      weather: 'Погода и время',
      maps: 'Карты и геолокация',
      translate: 'Переводы',
      currency: 'Валюты',
      documents: 'Документы',
      automation: 'Автоматизация'
    };
    return names[category] || category;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="Puzzle" size={20} className="text-primary" />
          Другие интеграции
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте дополнительные интеграции: погода, карты, переводы, валюты, документы, автоматизация
        </p>
      </div>

      <Tabs defaultValue="weather" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="weather">Погода</TabsTrigger>
          <TabsTrigger value="maps">Карты</TabsTrigger>
          <TabsTrigger value="translate">Переводы</TabsTrigger>
          <TabsTrigger value="currency">Валюты</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="automation">Автоматизация</TabsTrigger>
        </TabsList>

        {(['weather', 'maps', 'translate', 'currency', 'documents', 'automation'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.filter(p => p.category === category).map(provider => (
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
        ))}
      </Tabs>

      {selectedProvider && (
        <div className="mt-6">
          {renderConfigForm()}
        </div>
      )}
    </div>
  );
};

