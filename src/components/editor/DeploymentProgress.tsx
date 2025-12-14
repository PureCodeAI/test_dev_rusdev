import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

export type DeploymentStage = 
  | 'idle'
  | 'preparing'
  | 'validating'
  | 'optimizing'
  | 'building'
  | 'generating-html'
  | 'compiling-assets'
  | 'optimizing-images'
  | 'creating-sitemap'
  | 'uploading'
  | 'configuring'
  | 'setting-up-ssl'
  | 'verifying'
  | 'success'
  | 'failed';

export interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
  logs?: string[];
  error?: string;
  duration?: number;
}

interface DeploymentProgressProps {
  stage: DeploymentStage;
  steps: DeploymentStep[];
  overallProgress: number;
  onCancel?: () => void;
}

export const DeploymentProgress = ({
  stage,
  steps,
  overallProgress,
  onCancel
}: DeploymentProgressProps) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStageName = (stage: DeploymentStage): string => {
    const stageNames: Record<DeploymentStage, string> = {
      'idle': 'Ожидание',
      'preparing': 'Подготовка',
      'validating': 'Валидация',
      'optimizing': 'Оптимизация',
      'building': 'Сборка',
      'generating-html': 'Генерация HTML',
      'compiling-assets': 'Компиляция ресурсов',
      'optimizing-images': 'Оптимизация изображений',
      'creating-sitemap': 'Создание sitemap',
      'uploading': 'Загрузка',
      'configuring': 'Настройка',
      'setting-up-ssl': 'Настройка SSL',
      'verifying': 'Проверка',
      'success': 'Успешно',
      'failed': 'Ошибка'
    };
    return stageNames[stage] || stage;
  };

  const getStageIcon = (stage: DeploymentStage): string => {
    if (stage === 'success') return 'Check';
    if (stage === 'failed') return 'X';
    if (stage === 'idle') return 'Clock';
    return 'Loader2';
  };

  const getStepIcon = (status: DeploymentStep['status']): string => {
    switch (status) {
      case 'completed':
        return 'Check';
      case 'failed':
        return 'X';
      case 'in-progress':
        return 'Loader2';
      default:
        return 'Circle';
    }
  };

  const getStepColor = (status: DeploymentStep['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'in-progress':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStepBadge = (status: DeploymentStep['status']): JSX.Element => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Завершено</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Ошибка</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">В процессе</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Ожидание</Badge>;
    }
  };

  const stageGroups: Record<string, { name: string; steps: string[] }> = {
    preparation: {
      name: 'Подготовка',
      steps: ['validate', 'check-dependencies', 'optimize-resources', 'minify-code']
    },
    build: {
      name: 'Сборка',
      steps: ['generate-html', 'compile-css', 'compile-js', 'optimize-images', 'create-sitemap', 'create-robots']
    },
    upload: {
      name: 'Загрузка',
      steps: ['upload-files', 'sync-cdn']
    },
    configuration: {
      name: 'Настройка',
      steps: ['configure-nginx', 'setup-ssl', 'setup-caching', 'setup-redirects']
    },
    verification: {
      name: 'Проверка',
      steps: ['check-availability', 'check-ssl', 'check-speed', 'check-mobile']
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${
              stage === 'success' ? 'bg-green-500/10' :
              stage === 'failed' ? 'bg-red-500/10' :
              'bg-blue-500/10'
            }`}>
              <Icon
                name={getStageIcon(stage)}
                size={20}
                className={`${
                  stage === 'success' ? 'text-green-600' :
                  stage === 'failed' ? 'text-red-600' :
                  stage === 'idle' ? 'text-muted-foreground' :
                  'text-blue-600 animate-spin'
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold">Процесс деплоя</h3>
              <p className="text-sm text-muted-foreground">{getStageName(stage)}</p>
            </div>
          </div>
          {onCancel && stage !== 'success' && stage !== 'failed' && stage !== 'idle' && (
            <button
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Отменить
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Общий прогресс</span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {Object.entries(stageGroups).map(([groupId, group]) => {
              const groupSteps = steps.filter(s => group.steps.includes(s.id));
              const allCompleted = groupSteps.every(s => s.status === 'completed');
              const hasFailed = groupSteps.some(s => s.status === 'failed');
              const inProgress = groupSteps.some(s => s.status === 'in-progress');

              return (
                <Collapsible
                  key={groupId}
                  defaultOpen={inProgress || hasFailed}
                  onOpenChange={(open) => {
                    if (open) {
                      setExpandedSteps(new Set([...expandedSteps, groupId]));
                    } else {
                      const newExpanded = new Set(expandedSteps);
                      newExpanded.delete(groupId);
                      setExpandedSteps(newExpanded);
                    }
                  }}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon
                          name={allCompleted ? "Check" : hasFailed ? "X" : inProgress ? "Loader2" : "Circle"}
                          size={16}
                          className={`${
                            allCompleted ? "text-green-600" :
                            hasFailed ? "text-red-600" :
                            inProgress ? "text-blue-600 animate-spin" :
                            "text-muted-foreground"
                          }`}
                        />
                        <span className="font-semibold">{group.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {groupSteps.filter(s => s.status === 'completed').length} / {groupSteps.length}
                        </Badge>
                      </div>
                      <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-2 pl-6">
                      {groupSteps.map((step) => (
                        <div key={step.id} className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded">
                            <div className="flex items-center gap-2 flex-1">
                              <Icon
                                name={getStepIcon(step.status)}
                                size={14}
                                className={`${getStepColor(step.status)} ${
                                  step.status === 'in-progress' ? 'animate-spin' : ''
                                }`}
                              />
                              <span className="text-sm">{step.name}</span>
                              {step.duration && (
                                <span className="text-xs text-muted-foreground">
                                  ({step.duration}мс)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {step.progress !== undefined && step.status === 'in-progress' && (
                                <div className="w-24">
                                  <Progress value={step.progress} className="h-1" />
                                </div>
                              )}
                              {getStepBadge(step.status)}
                            </div>
                          </div>
                          {step.logs && step.logs.length > 0 && (
                            <Collapsible
                              open={expandedSteps.has(step.id)}
                              onOpenChange={(open) => toggleStep(step.id)}
                            >
                              <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
                                Показать логи ({step.logs.length})
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-1 p-2 bg-muted rounded font-mono text-xs max-h-32 overflow-y-auto">
                                  {step.logs.map((log, idx) => (
                                    <div key={idx} className="text-muted-foreground">
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          {step.error && (
                            <div className="p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-900 dark:text-red-100">
                              <div className="flex items-start gap-2">
                                <Icon name="AlertCircle" size={12} className="mt-0.5" />
                                <span>{step.error}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};

