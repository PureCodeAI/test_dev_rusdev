import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { InlineEditor } from './InlineEditor';
import { cn } from '@/lib/utils';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period?: 'month' | 'year';
  features: string[];
  popular?: boolean;
  buttonText?: string;
}

interface PricingTableProps {
  plans: PricingPlan[];
  onPlansChange: (plans: PricingPlan[]) => void;
  columns?: number;
  className?: string;
}

export const PricingTable = ({ plans, onPlansChange, columns = 3, className }: PricingTableProps) => {
  const handleAddPlan = () => {
    const newPlan: PricingPlan = {
      id: `plan-${Date.now()}`,
      name: 'Новый тариф',
      price: 0,
      period: 'month',
      features: ['Функция 1', 'Функция 2']
    };
    onPlansChange([...plans, newPlan]);
  };

  if (plans.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Button onClick={handleAddPlan}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить тариф
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("grid gap-6", `grid-cols-${columns}`)}>
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative p-6",
              plan.popular && "ring-2 ring-primary"
            )}
          >
            {plan.popular && (
              <Badge className="absolute top-4 right-4">Популярный</Badge>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">₽</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">/{plan.period === 'month' ? 'мес' : 'год'}</span>
                )}
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
            >
              {plan.buttonText || 'Выбрать'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

