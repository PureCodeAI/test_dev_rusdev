import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface CalendarIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const CALENDAR_PROVIDERS: CalendarProvider[] = [
  {
    id: 'calendly',
    name: 'Calendly',
    icon: 'Calendar',
    description: 'Бронирование встреч',
    features: ['Виджет', 'Автоматизация', 'Напоминания', 'Интеграции'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'youcanbookme',
    name: 'YouCanBookMe',
    icon: 'CalendarCheck',
    description: 'Онлайн бронирование',
    features: ['Виджет', 'Многоязычность', 'Оплата', 'Напоминания'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'acuity-scheduling',
    name: 'Acuity Scheduling',
    icon: 'CalendarDays',
    description: 'Планирование',
    features: ['Виджет', 'Групповые встречи', 'Оплата', 'Интеграции'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: 'Calendar',
    description: 'Интеграция с календарем',
    features: ['Синхронизация', 'События', 'Напоминания', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    icon: 'Calendar',
    description: 'Интеграция Outlook',
    features: ['Синхронизация', 'События', 'Напоминания', 'API'],
    isConfigured: false,
    config: {}
  }
];

export const CalendarIntegrations = ({ blockId, onIntegrationChange }: CalendarIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<CalendarProvider[]>(CALENDAR_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    timeSelection: boolean;
    slotAvailability: boolean;
    bookingNotifications: boolean;
    cancellation: boolean;
    eventCalendar: boolean;
  }>({
    timeSelection: true,
    slotAvailability: true,
    bookingNotifications: true,
    cancellation: true,
    eventCalendar: false
  });

  const handleProviderSelect = (provider: CalendarProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      timeSelection: true,
      slotAvailability: true,
      bookingNotifications: true,
      cancellation: true,
      eventCalendar: false
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
      case 'calendly':
        return [
          { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'your-username' },
          { key: 'eventType', label: 'Event Type', type: 'text', required: false, placeholder: '15min, 30min, etc.' },
          { key: 'embedCode', label: 'Embed Code', type: 'textarea', required: false, placeholder: 'Код для встраивания' }
        ];
      case 'youcanbookme':
        return [
          { key: 'accountId', label: 'Account ID', type: 'text', required: true, placeholder: '123456' },
          { key: 'calendarId', label: 'Calendar ID', type: 'text', required: false },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false }
        ];
      case 'acuity-scheduling':
        return [
          { key: 'schedulingId', label: 'Scheduling ID', type: 'text', required: true, placeholder: '12345678' },
          { key: 'apiKey', label: 'API Key', type: 'password', required: false },
          { key: 'apiUserId', label: 'API User ID', type: 'text', required: false }
        ];
      case 'google-calendar':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'calendarId', label: 'Calendar ID', type: 'text', required: false, placeholder: 'primary' },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'outlook-calendar':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
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
              ) : field.type === 'textarea' ? (
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                  value={(config[field.key] as string) || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                />
              ) : null}
            </div>
          ))}

          {(selectedProvider.id === 'google-calendar' || selectedProvider.id === 'outlook-calendar') && (
            <div>
              <Button onClick={() => {
                const oauthUrl = `/api/integrations/${selectedProvider.id}/oauth`;
                window.location.href = oauthUrl;
              }} variant="outline" className="w-full">
                <Icon name="Key" size={16} className="mr-2" />
                Авторизоваться через OAuth
              </Button>
            </div>
          )}

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Функции бронирования</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Выбор времени</Label>
                  <p className="text-xs text-muted-foreground">
                    Позволить пользователям выбирать время для бронирования
                  </p>
                </div>
                <Switch
                  checked={features.timeSelection}
                  onCheckedChange={(checked) => handleFeatureChange('timeSelection', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Доступность слотов</Label>
                  <p className="text-xs text-muted-foreground">
                    Показывать только доступные временные слоты
                  </p>
                </div>
                <Switch
                  checked={features.slotAvailability}
                  onCheckedChange={(checked) => handleFeatureChange('slotAvailability', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Уведомления о записи</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка уведомлений при новой записи
                  </p>
                </div>
                <Switch
                  checked={features.bookingNotifications}
                  onCheckedChange={(checked) => handleFeatureChange('bookingNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отмена бронирования</Label>
                  <p className="text-xs text-muted-foreground">
                    Позволить пользователям отменять бронирования
                  </p>
                </div>
                <Switch
                  checked={features.cancellation}
                  onCheckedChange={(checked) => handleFeatureChange('cancellation', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Календарь событий</Label>
                  <p className="text-xs text-muted-foreground">
                    Отображение календаря с запланированными событиями
                  </p>
                </div>
                <Switch
                  checked={features.eventCalendar}
                  onCheckedChange={(checked) => handleFeatureChange('eventCalendar', checked)}
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
          <Icon name="Calendar" size={20} className="text-primary" />
          Календари и бронирование
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с календарями и системами бронирования
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(provider => (
          <Card
            key={provider.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleProviderSelect(provider)}
          >
            <div className="flex flex-col items-center text-center">
              <Icon name={provider.icon as any} size={32} className="text-primary mb-2" />
              <h4 className="font-semibold mb-1">{provider.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {provider.features.slice(0, 2).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              {provider.isConfigured && (
                <Badge variant="default" className="bg-green-500 mt-2">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  Настроено
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

