import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface OnboardingStep {
  title: string;
  completed: boolean;
  inProgress?: boolean;
}

interface OnboardingSectionProps {
  steps: OnboardingStep[];
  stats: Array<{
    label: string;
    value: string;
    icon: string;
    color: string;
  }>;
}

export const OnboardingSection = ({
  steps,
  stats
}: OnboardingSectionProps) => {
  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2 animate-fade-in">
        <CardHeader>
          <CardTitle>Начало работы</CardTitle>
          <CardDescription>Пройдите основные шаги для запуска бизнеса</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Прогресс: {completedSteps}/{steps.length}</span>
              <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 transition-all duration-500" />
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer hover:scale-[1.02]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 
                  step.inProgress ? 'bg-blue-100 text-blue-600' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? <Icon name="Check" size={16} /> : index + 1}
                </div>
                <span className={`flex-1 ${step.completed ? 'text-muted-foreground line-through' : ''}`}>
                  {step.title}
                </span>
                {step.inProgress && <Icon name="ArrowRight" size={16} className="text-primary" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in" style={{animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards'}}>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
          <CardDescription>Основные показатели</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center ${stat.color}`}>
                  <Icon name={(stat.icon as string | undefined) || 'Circle'} size={20} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-lg font-semibold">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};