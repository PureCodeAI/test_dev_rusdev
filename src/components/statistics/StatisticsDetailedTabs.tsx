import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { IncomeExpenseStats } from '@/utils/bankStatementStats';
import API_ENDPOINTS from '@/config/api';
import { logger } from '@/utils/logger';
import { useAuth } from '@/context/AuthContext';

interface Product {
  name: string;
  sales: number;
  revenue: number;
}

interface BankConnection {
  name: string;
  connected: boolean;
  balance: number;
}

interface StatisticsDetailedTabsProps {
  topProducts: Product[];
  bankConnections: BankConnection[];
  bankStats?: IncomeExpenseStats | null;
  isLoading?: boolean;
}

const StatisticsDetailedTabs = ({ topProducts, bankConnections, bankStats, isLoading = false }: StatisticsDetailedTabsProps) => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : null;
  const [campaigns, setCampaigns] = useState<Array<{
    platform: string;
    budget: number;
    conversions: number;
    roi: number;
  }>>([]);
  const [geoData, setGeoData] = useState<Array<{
    city: string;
    visitors: number;
    percent: number;
  }>>([]);
  const [devices, setDevices] = useState<Array<{
    device: string;
    percent: number;
    icon: string;
    color: string;
  }>>([]);
  const [pages, setPages] = useState<Array<{
    page: string;
    views: number;
  }>>([]);

  const loadCampaigns = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=stats`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCampaigns(data.map((item: Record<string, unknown>) => ({
            platform: String(item.platform || 'Не указана'),
            budget: Number(item.budget || item.budget_total || 0),
            conversions: Number(item.conversions || 0),
            roi: Number(item.roi || 0)
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading campaigns', error instanceof Error ? error : new Error(String(error)), { userId });
      setCampaigns([]);
    }
  }, [userId]);

  const loadGeoData = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=analytics&action=geo`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const total = data.reduce((sum: number, item: Record<string, unknown>) => sum + (Number(item.visitors) || 0), 0);
          setGeoData(data.map((item: Record<string, unknown>) => ({
            city: String(item.city || item.location || 'Неизвестно'),
            visitors: Number(item.visitors || 0),
            percent: total > 0 ? Math.round((Number(item.visitors) / total) * 100) : 0
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading geo data', error instanceof Error ? error : new Error(String(error)), { userId });
      setGeoData([]);
    }
  }, [userId]);

  const loadDevices = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=analytics&action=devices`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setDevices(data.map((item: Record<string, unknown>) => ({
            device: String(item.device || item.device_type || 'Неизвестно'),
            percent: Number(item.percent || 0),
            icon: String(item.icon || (item.device === 'mobile' ? 'Smartphone' : item.device === 'tablet' ? 'Tablet' : 'Monitor')),
            color: String(item.color || 'bg-primary')
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading devices', error instanceof Error ? error : new Error(String(error)), { userId });
      setDevices([]);
    }
  }, [userId]);

  const loadPages = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=analytics&action=pages`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPages(data.map((item: Record<string, unknown>) => ({
            page: String(item.page || item.page_path || '/'),
            views: Number(item.views || item.views_count || 0)
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading pages', error instanceof Error ? error : new Error(String(error)), { userId });
      setPages([]);
    }
  }, [userId]);

  useEffect(() => {
    loadCampaigns();
    loadGeoData();
    loadDevices();
    loadPages();
  }, [loadCampaigns, loadGeoData, loadDevices, loadPages]);

  return (
    <>
      <TabsContent value="ads" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Детальная статистика по кампаниям</CardTitle>
            <CardDescription>Сравнение эффективности рекламных платформ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{campaign.platform}</h4>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Бюджет: ₽{campaign.budget.toLocaleString()}</span>
                      <span className="text-muted-foreground">Конверсии: {campaign.conversions}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{campaign.roi}%</div>
                    <div className="text-xs text-muted-foreground">ROI</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" className="text-blue-600" />
              AI-рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="traffic" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>География посетителей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geoData.map((geo, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{geo.city}</span>
                      <span className="text-sm font-medium">{geo.visitors}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${geo.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Устройства</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devices.map((dev, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Icon name={dev.icon} size={20} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{dev.device}</span>
                        <span className="text-sm font-medium">{dev.percent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${dev.color}`} style={{ width: `${dev.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Популярные страницы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pages.map((page, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm">{page.page}</span>
                    <Badge variant="outline">{page.views}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sales" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Топ продаваемых товаров</CardTitle>
            <CardDescription>За выбранный период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{product.name}</h4>
                    <div className="text-sm text-muted-foreground">Продано: {product.sales} шт</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₽{product.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Выручка</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Средний чек</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">₽0</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Нет данных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Конверсия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">0%</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Нет данных
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="finance" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Интеграция с банками</CardTitle>
            <CardDescription>Подключите счета для автоматического учета</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankConnections.map((bank, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          bank.connected ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Icon name="Building" className={bank.connected ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        <div>
                          <div className="font-semibold">{bank.name}</div>
                          {bank.connected && (
                            <div className="text-sm text-muted-foreground">
                              Баланс: ₽{bank.balance.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant={bank.connected ? 'outline' : 'default'}>
                        {bank.connected ? 'Настроить' : 'Подключить'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" className="text-yellow-600" />
              AI-бухгалтер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <Icon name="Bell" className="text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Напоминание о налогах</h4>
                  <p className="text-sm text-muted-foreground">
                    Нет активных напоминаний
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <Icon name="Lightbulb" className="text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Рекомендация по оптимизации</h4>
                  <p className="text-sm text-muted-foreground">
                    Нет рекомендаций
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Доходы и расходы</CardTitle>
            <CardDescription>Детальная разбивка из банковских выписок</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" className="animate-spin" size={24} />
              </div>
            ) : !bankStats || Object.keys(bankStats.byCategory).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Загрузите банковские выписки в разделе "Интеграции" для отображения данных</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-green-600">Доходы</span>
                    <span className="font-bold text-green-600">₽{bankStats.totalIncome.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="space-y-2 pl-4 max-h-48 overflow-y-auto">
                    {Object.entries(bankStats.byCategory)
                      .filter(([_, data]) => data.income > 0)
                      .sort(([_, a], [__, b]) => b.income - a.income)
                      .slice(0, 10)
                      .map(([category, data]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate">{category}</span>
                          <span className="font-semibold text-green-600">₽{data.income.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-red-600">Расходы</span>
                    <span className="font-bold text-red-600">₽{bankStats.totalExpense.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="space-y-2 pl-4 max-h-48 overflow-y-auto">
                    {Object.entries(bankStats.byCategory)
                      .filter(([_, data]) => data.expense > 0)
                      .sort(([_, a], [__, b]) => b.expense - a.expense)
                      .slice(0, 10)
                      .map(([category, data]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate">{category}</span>
                          <span className="font-semibold text-red-600">₽{data.expense.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-bold">Чистая прибыль</span>
                    <span className={`font-bold text-2xl ${bankStats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₽{bankStats.netProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default StatisticsDetailedTabs;
