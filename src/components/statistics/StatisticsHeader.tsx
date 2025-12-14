import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface StatisticsHeaderProps {
  period: string;
  onPeriodChange: (value: string) => void;
}

const StatisticsHeader = ({ period, onPeriodChange }: StatisticsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-2">Статистика</h1>
        <p className="text-muted-foreground">Единая панель аналитики бизнеса</p>
      </div>
      <div className="flex gap-2">
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Сегодня</SelectItem>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="year">Год</SelectItem>
            <SelectItem value="custom">Свой период</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Icon name="Download" className="mr-2" size={16} />
          PDF
        </Button>
        <Button variant="outline">
          <Icon name="FileSpreadsheet" className="mr-2" size={16} />
          Excel
        </Button>
      </div>
    </div>
  );
};

export default StatisticsHeader;
