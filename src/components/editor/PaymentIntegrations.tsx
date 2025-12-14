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

interface PaymentProvider {
  id: string;
  name: string;
  category: 'international' | 'russian' | 'crypto';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface PaymentIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'international',
    icon: 'CreditCard',
    description: 'Карты, Apple Pay, Google Pay, криптовалюты',
    features: ['Карты', 'Apple Pay', 'Google Pay', 'Криптовалюты', 'Подписки', 'Инвойсы'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'international',
    icon: 'Wallet',
    description: 'PayPal, кредитные карты',
    features: ['PayPal', 'Кредитные карты', 'Подписки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'square',
    name: 'Square',
    category: 'international',
    icon: 'Square',
    description: 'Карты, мобильные платежи',
    features: ['Карты', 'Мобильные платежи'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'braintree',
    name: 'Braintree',
    category: 'international',
    icon: 'CreditCard',
    description: 'Карты, PayPal, Venmo',
    features: ['Карты', 'PayPal', 'Venmo'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'adyen',
    name: 'Adyen',
    category: 'international',
    icon: 'Globe',
    description: 'Мульти-платежная система',
    features: ['Множество методов оплаты', 'Глобальные платежи'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yookassa',
    name: 'ЮKassa (YooKassa)',
    category: 'russian',
    icon: 'CreditCard',
    description: 'Карты, СБП, электронные кошельки',
    features: ['Карты', 'СБП', 'Электронные кошельки', 'Подписки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'cloudpayments',
    name: 'CloudPayments',
    category: 'russian',
    icon: 'Cloud',
    description: 'Карты, Apple Pay, Google Pay',
    features: ['Карты', 'Apple Pay', 'Google Pay', 'Подписки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'paykeeper',
    name: 'PayKeeper',
    category: 'russian',
    icon: 'Wallet',
    description: 'Карты, СБП, кошельки',
    features: ['Карты', 'СБП', 'Кошельки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'robokassa',
    name: 'Robokassa',
    category: 'russian',
    icon: 'Wallet',
    description: 'Карты, электронные кошельки',
    features: ['Карты', 'Электронные кошельки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'payanyway',
    name: 'PayAnyWay',
    category: 'russian',
    icon: 'CreditCard',
    description: 'Карты, СБП, кошельки',
    features: ['Карты', 'СБП', 'Кошельки'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'tinkoff',
    name: 'Тинькофф',
    category: 'russian',
    icon: 'CreditCard',
    description: 'Карты, СБП',
    features: ['Карты', 'СБП'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'sberbank',
    name: 'Сбербанк',
    category: 'russian',
    icon: 'Building2',
    description: 'Карты, СБП',
    features: ['Карты', 'СБП'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'coinbase',
    name: 'Coinbase Commerce',
    category: 'crypto',
    icon: 'Bitcoin',
    description: 'Bitcoin, Ethereum, другие криптовалюты',
    features: ['Bitcoin', 'Ethereum', 'Другие криптовалюты'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'nowpayments',
    name: 'NOWPayments',
    category: 'crypto',
    icon: 'Bitcoin',
    description: '150+ криптовалют',
    features: ['150+ криптовалют'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'btcpay',
    name: 'BTCPay Server',
    category: 'crypto',
    icon: 'Bitcoin',
    description: 'Bitcoin и другие',
    features: ['Bitcoin', 'Другие криптовалюты'],
    isConfigured: false,
    config: {}
  }
];

export const PaymentIntegrations = ({ blockId, onIntegrationChange }: PaymentIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<PaymentProvider[]>(PAYMENT_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});

  const handleProviderSelect = (provider: PaymentProvider) => {
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
      case 'stripe':
        return [
          { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false },
          { key: 'testMode', label: 'Тестовый режим', type: 'switch', required: false }
        ];
      case 'paypal':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'mode', label: 'Режим', type: 'select', options: ['sandbox', 'live'], required: true }
        ];
      case 'yookassa':
        return [
          { key: 'shopId', label: 'Shop ID', type: 'text', required: true },
          { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
          { key: 'testMode', label: 'Тестовый режим', type: 'switch', required: false }
        ];
      case 'cloudpayments':
        return [
          { key: 'publicId', label: 'Public ID', type: 'text', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
        ];
      case 'coinbase':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false }
        ];
      default:
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
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
                  placeholder={`Введите ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'switch' ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={(config[field.key] as boolean) || false}
                    onCheckedChange={(checked) => handleConfigChange(field.key, checked)}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {field.label}
                  </Label>
                </div>
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
          <Icon name="CreditCard" size={20} className="text-primary" />
          Платежные системы
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с платежными системами для приема оплаты
        </p>
      </div>

      <Tabs defaultValue="international" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="international">Международные</TabsTrigger>
          <TabsTrigger value="russian">Российские</TabsTrigger>
          <TabsTrigger value="crypto">Криптовалюты</TabsTrigger>
        </TabsList>

        <TabsContent value="international" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'international').map(provider => (
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

        <TabsContent value="russian" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'russian').map(provider => (
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

        <TabsContent value="crypto" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'crypto').map(provider => (
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

