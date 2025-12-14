// Компонент для отображения статистики AI

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

interface AIStats {
  tokensUsed: number;
  cost: number;
  models?: Array<{
    model: string;
    tokensUsed: number;
    cost: number;
  }>;
}

export const AIStats = () => {
  const { user, isHydrating } = useAuth();
  const [stats, setStats] = useState<AIStats>({ tokensUsed: 0, cost: 0 });
  const [loading, setLoading] = useState(true);

  const currency = useMemo(() => (import.meta.env.VITE_DEFAULT_CURRENCY || 'RUB') as string, []);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined), []);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [currency],
  );

  const loadStats = useCallback(async () => {
    if (!user?.id || isHydrating) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.aiUsage}?action=monthly&user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          tokensUsed: data.tokens_used || 0,
          cost: data.cost || 0,
          models: data.models || [],
        });
      }
    } catch (error) {
      logger.error('Error loading AI stats', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, [user?.id, isHydrating]);

  useEffect(() => {
    if (!isHydrating) {
      loadStats();
    }
  }, [isHydrating, loadStats]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon name="LineChart" size={20} />
          Статистика AI
        </CardTitle>
        <CardDescription className="text-gray-400">
          Использование токенов за текущий месяц
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" className="animate-spin" size={24} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Токенов использовано</div>
                <div className="text-2xl font-bold text-white">
                  {numberFormatter.format(stats.tokensUsed)}
                </div>
                <div className="text-xs text-gray-500">
                  ≈ {numberFormatter.format(Math.round(stats.tokensUsed / 1000))} тыс.
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Стоимость</div>
                <div className="text-2xl font-bold text-white">
                  {currencyFormatter.format(stats.cost)}
                </div>
                <div className="text-xs text-gray-500">
                  за месяц
                </div>
              </div>
            </div>
            
            {stats.models && stats.models.length > 0 && (
              <div className="pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Распределение по моделям</div>
                <div className="space-y-2">
                  {stats.models.map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {model.model}
                        </Badge>
                        <span className="text-sm text-white">
                          {index === 0 ? 'Основная модель' : 'Резервная'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                          {numberFormatter.format(model.tokensUsed)} токенов
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={loadStats}
            >
              <Icon name="RefreshCw" size={14} className="mr-2" />
              Обновить статистику
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

