import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MetricData {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SummaryMetric {
  title: string;
  data: MetricData[];
  icon: string;
  color: string;
}

interface StatisticsSummaryCardsProps {
  summaryMetrics: SummaryMetric[];
}

const StatisticsSummaryCards = ({ summaryMetrics }: StatisticsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon name={metric.icon} size={20} className={metric.color} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metric.data.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.highlight ? 'text-green-600' : ''}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsSummaryCards;
