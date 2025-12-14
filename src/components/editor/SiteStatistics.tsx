import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface SiteStatisticsProps {
  projectId?: number;
}

interface StatisticsData {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnSite: number;
  conversions: number;
  bounceRate: number;
  pages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
    averageTime: number;
  }>;
  visitors: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
  devices: Array<{
    device: string;
    count: number;
    percent: number;
  }>;
  sources: Array<{
    source: string;
    visitors: number;
    percent: number;
  }>;
}

export const SiteStatistics = ({ projectId }: SiteStatisticsProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [period, projectId]);

  const loadStatistics = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/statistics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        setStatistics({
          pageViews: 0,
          uniqueVisitors: 0,
          averageTimeOnSite: 0,
          conversions: 0,
          bounceRate: 0,
          pages: [],
          visitors: [],
          devices: [],
          sources: []
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
        variant: "destructive"
      });
      setStatistics({
        pageViews: 0,
        uniqueVisitors: 0,
        averageTimeOnSite: 0,
        conversions: 0,
        bounceRate: 0,
        pages: [],
        visitors: [],
        devices: [],
        sources: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (reportType: 'daily' | 'weekly' | 'monthly') => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/statistics/export?type=${reportType}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Отчет экспортирован",
          description: `Отчет ${reportType} успешно скачан`
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось экспортировать отчет",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать отчет",
        variant: "destructive"
      });
    }
  };

  if (!statistics) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          {isLoading ? 'Загрузка статистики...' : 'Статистика недоступна'}
        </div>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}м ${secs}с`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Icon name="BarChart" size={20} className="text-primary" />
            Статистика сайта
          </h3>
          <p className="text-sm text-muted-foreground">
            Аналитика и отчеты по посещаемости сайта
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Ежедневно</SelectItem>
              <SelectItem value="weekly">Еженедельно</SelectItem>
              <SelectItem value="monthly">Ежемесячно</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport(period)}>
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Просмотры страниц</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(statistics.pageViews)}</p>
            </div>
            <Icon name="Eye" size={24} className="text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Уникальные посетители</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(statistics.uniqueVisitors)}</p>
            </div>
            <Icon name="Users" size={24} className="text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Время на сайте</p>
              <p className="text-2xl font-bold mt-1">{formatTime(statistics.averageTimeOnSite)}</p>
            </div>
            <Icon name="Clock" size={24} className="text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Конверсии</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(statistics.conversions)}</p>
            </div>
            <Icon name="Target" size={24} className="text-primary" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="pages">Страницы</TabsTrigger>
          <TabsTrigger value="visitors">Посетители</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Устройства</h4>
              <div className="space-y-2">
                {statistics.devices.map((device, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name={device.device === 'Desktop' ? 'Monitor' : device.device === 'Mobile' ? 'Smartphone' : 'Tablet'} size={16} />
                      <span className="text-sm">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatNumber(device.count)}</span>
                      <Badge variant="outline">{device.percent}%</Badge>
                    </div>
                  </div>
                ))}
                {statistics.devices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-4">Источники трафика</h4>
              <div className="space-y-2">
                {statistics.sources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatNumber(source.visitors)}</span>
                      <Badge variant="outline">{source.percent}%</Badge>
                    </div>
                  </div>
                ))}
                {statistics.sources.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <h4 className="font-semibold mb-4">Показатель отказов</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${statistics.bounceRate}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-semibold">{statistics.bounceRate.toFixed(1)}%</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4 mt-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Популярные страницы</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {statistics.pages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{page.path}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(page.views)} просмотров • {formatNumber(page.uniqueVisitors)} уникальных • {formatTime(page.averageTime)} среднее время
                      </p>
                    </div>
                  </div>
                ))}
                {statistics.pages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет данных о страницах</p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-4 mt-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Динамика посетителей</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {statistics.visitors.map((visitor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{new Date(visitor.date).toLocaleDateString('ru-RU')}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(visitor.visitors)} посетителей • {formatNumber(visitor.pageViews)} просмотров
                      </p>
                    </div>
                  </div>
                ))}
                {statistics.visitors.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет данных о посетителях</p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Экспорт отчетов</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Скачайте отчеты в формате JSON для дальнейшего анализа
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => exportReport('daily')}
              >
                <Icon name="FileText" size={24} />
                <div className="text-center">
                  <p className="font-semibold">Ежедневный отчет</p>
                  <p className="text-xs text-muted-foreground">Статистика за день</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => exportReport('weekly')}
              >
                <Icon name="FileText" size={24} />
                <div className="text-center">
                  <p className="font-semibold">Еженедельный отчет</p>
                  <p className="text-xs text-muted-foreground">Статистика за неделю</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => exportReport('monthly')}
              >
                <Icon name="FileText" size={24} />
                <div className="text-center">
                  <p className="font-semibold">Ежемесячный отчет</p>
                  <p className="text-xs text-muted-foreground">Статистика за месяц</p>
                </div>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

