import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';

interface OnboardingStep {
  title: string;
  completed: boolean;
  inProgress?: boolean;
  action?: () => void;
}

interface OnboardingCardProps {
  steps: OnboardingStep[];
  onClose?: () => void;
}

export const OnboardingCard = ({ steps, onClose }: OnboardingCardProps) => {
  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Logo size={140} className="text-primary" />
              Начало работы
            </CardTitle>
            <CardDescription>Завершите настройку для лучшего опыта</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-semibold">{completedSteps} из {steps.length}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.inProgress ? 'bg-primary/5 border border-primary/20' : 'bg-background/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.completed
                  ? 'bg-green-500'
                  : step.inProgress
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}>
                {step.completed ? (
                  <Icon name="Check" size={14} className="text-white" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${
                    step.inProgress ? 'bg-white' : 'bg-muted-foreground'
                  }`} />
                )}
              </div>
              <span className={`flex-1 ${step.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                {step.title}
              </span>
              {step.action && !step.completed && (
                <Button size="sm" variant="outline" onClick={step.action}>
                  Начать
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
