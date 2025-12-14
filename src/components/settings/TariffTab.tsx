import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { getMonthlyUsage } from '@/utils/aiUsageTracker';
import { useAuth } from '@/context/AuthContext';

interface TariffTabProps {
  currentTariff: string;
}

const MODEL_OPTIONS = [
  { value: 'gpt4', label: 'GPT-4 (OpenAI) - ₽0.03/1K токенов' },
  { value: 'claude', label: 'Claude 3 (Anthropic) - ₽0.025/1K токенов' },
  { value: 'gemini', label: 'Gemini Pro (Google) - ₽0.02/1K токенов' },
];

export const TariffTab = ({ currentTariff }: TariffTabProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preferredModel, setPreferredModel] = useState('gpt4');
  const [monthlyUsage, setMonthlyUsage] = useState({ tokensUsed: 0, cost: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadAISettings = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(API_ENDPOINTS.aiSettings, {
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferred_model) {
          setPreferredModel(data.preferred_model);
        }
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }, [user?.id]);

  const loadMonthlyUsage = useCallback(async () => {
    setIsLoading(true);
    try {
      const usage = await getMonthlyUsage(user?.id || undefined);
      setMonthlyUsage(usage);
    } catch (error) {
      // Игнорируем ошибки
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAISettings();
    loadMonthlyUsage();
  }, [loadAISettings, loadMonthlyUsage]);

  const handleModelChange = async (value: string) => {
    setPreferredModel(value);
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(API_ENDPOINTS.aiSettings, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          preferred_model: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast({
        title: 'Успешно',
        description: 'Настройки AI обновлены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Текущий тариф</CardTitle>
          <CardDescription>Вы используете тариф {currentTariff}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">₽0<span className="text-lg text-muted-foreground font-normal">/мес</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>1 сайт</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Базовая аналитика</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>AI-консультант</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Текущий</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Текущий
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-4">₽990<span className="text-lg text-muted-foreground font-normal">/мес</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>10 сайтов</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Безлимит ботов</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Расширенная аналитика</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Все интеграции</span>
                  </li>
                </ul>
                <Button className="w-full">Управление</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="text-3xl font-bold mb-4">₽2,990<span className="text-lg text-muted-foreground font-normal">/мес</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Безлимит сайтов</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Белый лейбл</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>API доступ</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-primary" />
                    <span>Приоритетная поддержка</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Перейти</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-доступ</CardTitle>
          <CardDescription>Настройка использования AI-моделей</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Предпочитаемая модель</Label>
            <Select value={preferredModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Использование за месяц</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Icon name="Loader2" className="animate-spin" size={20} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Израсходовано токенов:</span>
                  <span className="font-semibold">{monthlyUsage.tokensUsed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Стоимость:</span>
                  <span className="font-semibold">₽{typeof monthlyUsage.cost === 'number' ? monthlyUsage.cost.toFixed(2) : Number(monthlyUsage.cost || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
