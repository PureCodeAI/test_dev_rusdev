import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { IncomeExpenseStats } from '@/utils/bankStatementStats';

interface StatisticsOverviewTabProps {
  bankStats: IncomeExpenseStats | null;
  isLoading: boolean;
}

const StatisticsOverviewTab = ({ bankStats, isLoading }: StatisticsOverviewTabProps) => {
  const chartData = bankStats?.byDate.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    Доходы: item.income,
    Расходы: item.expense,
  })) || [];

  return (
    <TabsContent value="overview" className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Доходы и расходы</CardTitle>
            <CardDescription>Динамика из банковских выписок</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Icon name="Loader2" className="animate-spin" size={32} />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Icon name="TrendingUp" size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Загрузите банковские выписки для отображения данных</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Доходы" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="Расходы" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Конверсии</CardTitle>
            <CardDescription>Сравнение по источникам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Столбчатая диаграмма</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Источники трафика</CardTitle>
            <CardDescription>Распределение посетителей</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Icon name="PieChart" size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Круговая диаграмма</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тепловая карта активности</CardTitle>
            <CardDescription>Пиковые часы посещений</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Icon name="Grid3x3" size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Тепловая карта</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default StatisticsOverviewTab;
