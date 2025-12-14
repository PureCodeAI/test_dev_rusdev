import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import StatisticsSummaryCards from '@/components/statistics/StatisticsSummaryCards';
import StatisticsOverviewTab from '@/components/statistics/StatisticsOverviewTab';
import StatisticsDetailedTabs from '@/components/statistics/StatisticsDetailedTabs';
import { getBankStatementStats, type IncomeExpenseStats } from '@/utils/bankStatementStats';
import API_ENDPOINTS from '@/config/api';
import { logger } from '@/utils/logger';

const Statistics = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [bankStats, setBankStats] = useState<IncomeExpenseStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [summaryMetrics, setSummaryMetrics] = useState<Array<{
    title: string;
    data: Array<{ label: string; value: string; highlight?: boolean }>;
    icon: string;
    color: string;
  }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{
    name: string;
    sales: number;
    revenue: number;
  }>>([]);
  const [bankConnections, setBankConnections] = useState<Array<{
    name: string;
    connected: boolean;
    balance: number;
  }>>([]);

  const loadBankStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const stats = await getBankStatementStats(period);
      setBankStats(stats);
    } catch (error) {
      logger.error('Error loading bank stats', error instanceof Error ? error : new Error(String(error)), { period });
    } finally {
      setIsLoadingStats(false);
    }
  }, [period]);

  const loadSummaryMetrics = useCallback(async () => {
    try {
      const stats = await getBankStatementStats(period);
      const metrics = [
        {
          title: 'Доходы',
          data: [
            { label: 'Всего', value: `₽${stats.totalIncome.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}`, highlight: true },
            { label: 'За период', value: period }
          ],
          icon: 'TrendingUp',
          color: 'text-green-600'
        },
        {
          title: 'Расходы',
          data: [
            { label: 'Всего', value: `₽${stats.totalExpense.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}`, highlight: true },
            { label: 'За период', value: period }
          ],
          icon: 'TrendingDown',
          color: 'text-red-600'
        },
        {
          title: 'Прибыль',
          data: [
            { label: 'Чистая', value: `₽${stats.netProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}`, highlight: true },
            { label: 'Рост', value: stats.netProfit >= 0 ? '+' : '' }
          ],
          icon: 'DollarSign',
          color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
        },
        {
          title: 'Транзакции',
          data: [
            { label: 'Всего', value: String(stats.transactions.length) },
            { label: 'Категорий', value: String(Object.keys(stats.byCategory).length) }
          ],
          icon: 'FileText',
          color: 'text-blue-600'
        }
      ];
      setSummaryMetrics(metrics);
    } catch (error) {
      logger.error('Error loading summary metrics', error instanceof Error ? error : new Error(String(error)), { period });
      setSummaryMetrics([]);
    }
  }, [period]);

  const loadTopProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=products&action=top&period=${period}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTopProducts(data.map((item: Record<string, unknown>) => ({
            name: String(item.name || item.title || 'Товар'),
            sales: Number(item.sales || item.purchases || 0),
            revenue: Number(item.revenue || item.total_revenue || 0)
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading top products', error instanceof Error ? error : new Error(String(error)), { period });
      setTopProducts([]);
    }
  }, [period]);

  const loadBankConnections = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.integrations}?type=bank`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setBankConnections(data.map((item: Record<string, unknown>) => ({
            name: String(item.bank_name || item.name || 'Банк'),
            connected: Boolean(item.is_connected || item.connected || false),
            balance: Number(item.balance || 0)
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading bank connections', error instanceof Error ? error : new Error(String(error)));
      setBankConnections([]);
    }
  }, []);

  useEffect(() => {
    loadBankStats();
    loadSummaryMetrics();
    loadTopProducts();
    loadBankConnections();
  }, [period, loadBankStats, loadSummaryMetrics, loadTopProducts, loadBankConnections]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <StatisticsHeader period={period} onPeriodChange={(value) => setPeriod(value as typeof period)} />

        <StatisticsSummaryCards summaryMetrics={summaryMetrics} />

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="ads">Реклама</TabsTrigger>
            <TabsTrigger value="traffic">Заинтересованность</TabsTrigger>
            <TabsTrigger value="sales">Покупки</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
          </TabsList>

          <StatisticsOverviewTab bankStats={bankStats} isLoading={isLoadingStats} />
          
          <StatisticsDetailedTabs 
            topProducts={topProducts}
            bankConnections={bankConnections}
            bankStats={bankStats}
            isLoading={isLoadingStats}
          />
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
