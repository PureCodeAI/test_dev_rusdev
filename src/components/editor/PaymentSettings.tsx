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

interface PaymentSettingsProps {
  paymentConfig: {
    enabled: boolean;
    providers: string[];
    defaultProvider: string;
    currency: string;
    paymentTypes: {
      oneTime: boolean;
      subscription: boolean;
      partial: boolean;
      installment: boolean;
    };
    notifications: {
      email: boolean;
      webhook: boolean;
    };
  };
  onConfigChange: (config: PaymentSettingsProps['paymentConfig']) => void;
}

export const PaymentSettings = ({ paymentConfig, onConfigChange }: PaymentSettingsProps) => {
  const [config, setConfig] = useState(paymentConfig);

  const handleChange = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handlePaymentTypeChange = (type: keyof typeof config.paymentTypes, value: boolean) => {
    const newConfig = {
      ...config,
      paymentTypes: {
        ...config.paymentTypes,
        [type]: value
      }
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleNotificationChange = (type: keyof typeof config.notifications, value: boolean) => {
    const newConfig = {
      ...config,
      notifications: {
        ...config.notifications,
        [type]: value
      }
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="Settings" size={20} className="text-primary" />
          Настройки платежей
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте параметры приема платежей
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Включить платежи</Label>
              <p className="text-sm text-muted-foreground">
                Разрешить прием платежей через выбранные системы
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>

          <Separator />

          <div>
            <Label className="mb-2 block">Валюта по умолчанию</Label>
            <Select
              value={config.currency}
              onValueChange={(value) => handleChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RUB">RUB (₽)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CNY">CNY (¥)</SelectItem>
                <SelectItem value="KZT">KZT (₸)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Провайдер по умолчанию</Label>
            <Select
              value={config.defaultProvider}
              onValueChange={(value) => handleChange('defaultProvider', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.providers.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
                {config.providers.length === 0 && (
                  <SelectItem value="none" disabled>Нет настроенных провайдеров</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <Label className="mb-4 block">Типы платежей</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Одноразовые платежи</Label>
                  <p className="text-xs text-muted-foreground">
                    Разовый платеж за товар или услугу
                  </p>
                </div>
                <Switch
                  checked={config.paymentTypes.oneTime}
                  onCheckedChange={(checked) => handlePaymentTypeChange('oneTime', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Подписки</Label>
                  <p className="text-xs text-muted-foreground">
                    Регулярные платежи (recurring payments)
                  </p>
                </div>
                <Switch
                  checked={config.paymentTypes.subscription}
                  onCheckedChange={(checked) => handlePaymentTypeChange('subscription', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Частичные платежи</Label>
                  <p className="text-xs text-muted-foreground">
                    Возможность оплаты частями
                  </p>
                </div>
                <Switch
                  checked={config.paymentTypes.partial}
                  onCheckedChange={(checked) => handlePaymentTypeChange('partial', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Рассрочка</Label>
                  <p className="text-xs text-muted-foreground">
                    Оплата в рассрочку без переплаты
                  </p>
                </div>
                <Switch
                  checked={config.paymentTypes.installment}
                  onCheckedChange={(checked) => handlePaymentTypeChange('installment', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="mb-4 block">Уведомления</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email уведомления</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка уведомлений о платежах на email
                  </p>
                </div>
                <Switch
                  checked={config.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Webhook уведомления</Label>
                  <p className="text-xs text-muted-foreground">
                    Отправка webhook при изменении статуса платежа
                  </p>
                </div>
                <Switch
                  checked={config.notifications.webhook}
                  onCheckedChange={(checked) => handleNotificationChange('webhook', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

