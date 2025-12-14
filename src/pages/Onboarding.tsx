import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import type { OnboardingData } from '@/types/academy';
import { safeLocalStorageSet } from '@/utils/localStorage';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const questions = [
    {
      id: 'businessType',
      question: 'Какой у вас текущий бизнес или бизнес-идея?',
      type: 'text',
      placeholder: 'Опишите ваш бизнес или идею',
    },
    {
      id: 'businessStage',
      question: 'На какой стадии развития находится ваш бизнес?',
      type: 'radio',
      options: [
        { value: 'idea', label: 'Идея (еще не запущен)' },
        { value: 'startup', label: 'Стартап (первые месяцы)' },
        { value: 'growing', label: 'Растущий бизнес' },
        { value: 'mature', label: 'Зрелый бизнес' },
      ],
    },
    {
      id: 'industry',
      question: 'В какой индустрии/нише вы работаете?',
      type: 'text',
      placeholder: 'Например: IT, ресторанный бизнес, e-commerce...',
    },
    {
      id: 'targetAudience',
      question: 'Кто ваша целевая аудитория?',
      type: 'text',
      placeholder: 'Опишите ваших клиентов',
    },
    {
      id: 'monthlyRevenue',
      question: 'Какой у вас ежемесячный оборот? (если есть)',
      type: 'number',
      placeholder: 'Введите сумму в рублях',
    },
    {
      id: 'employeesCount',
      question: 'Сколько у вас сотрудников?',
      type: 'number',
      placeholder: 'Введите количество',
    },
    {
      id: 'businessGoals',
      question: 'Какие основные бизнес-цели на ближайший год?',
      type: 'textarea',
      placeholder: 'Опишите ваши цели',
    },
    {
      id: 'challenges',
      question: 'С какими основными вызовами/проблемами вы сталкиваетесь?',
      type: 'textarea',
      placeholder: 'Опишите ваши проблемы',
    },
    {
      id: 'financialLiteracy',
      question: 'Оцените ваш уровень финансовой грамотности (от 1 до 10)',
      type: 'number',
      placeholder: '1-10',
      min: 1,
      max: 10,
    },
    {
      id: 'entrepreneurshipExperience',
      question: 'Какой у вас опыт в предпринимательстве? (в годах)',
      type: 'number',
      placeholder: 'Введите количество лет',
    },
    {
      id: 'preferredFormat',
      question: 'Какой формат обучения вы предпочитаете?',
      type: 'radio',
      options: [
        { value: 'text', label: 'Текст' },
        { value: 'video', label: 'Видео' },
        { value: 'interactive', label: 'Интерактив' },
      ],
    },
    {
      id: 'weeklyHours',
      question: 'Сколько часов в неделю вы готовы уделять обучению?',
      type: 'number',
      placeholder: 'Введите количество часов',
    },
  ];

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = () => {
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      toast({
        title: 'Ошибка валидации',
        description: validation.message || 'Пожалуйста, заполните поле',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const onboardingData: OnboardingData = {
      businessType: data.businessType || '',
      businessStage: data.businessStage || 'idea',
      industry: data.industry || '',
      targetAudience: data.targetAudience || '',
      monthlyRevenue: data.monthlyRevenue || 0,
      employeesCount: data.employeesCount || 0,
      entrepreneurshipExperience: data.entrepreneurshipExperience || 0,
      financialLiteracy: data.financialLiteracy || 5,
      businessGoals: Array.isArray(data.businessGoals) ? data.businessGoals : [],
      challenges: Array.isArray(data.challenges) ? data.challenges : [],
      preferredFormat: data.preferredFormat || 'slides',
      weeklyHours: data.weeklyHours || data.learningHours || 5,
    };
    
    const saved = safeLocalStorageSet('academyOnboarding', JSON.stringify(onboardingData));
    if (!saved) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить данные. Очистите старые данные и попробуйте снова.',
        variant: 'destructive',
      });
      return;
    }
    
    // Переходим к генерации курсов
    navigate('/university?generate=true');
  };

  const handleChange = (id: string, value: string | number | string[]) => {
    if (id === 'businessGoals' || id === 'challenges') {
      const stringValue = typeof value === 'string' ? value : String(value);
      const arrayValue = stringValue.split('\n').filter((line) => line.trim().length > 0);
      setData((prev) => ({ ...prev, [id]: arrayValue }));
    } else {
      setData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const validateCurrentStep = (): { isValid: boolean; message?: string } => {
    const question = questions[currentStep];
    const value = data[question.id as keyof OnboardingData];
    
    if (question.type === 'number') {
      const numValue = value as number | undefined;
      if (numValue === undefined || numValue === null) {
        return { isValid: false, message: 'Пожалуйста, заполните это поле' };
      }
      if (isNaN(numValue)) {
        return { isValid: false, message: 'Введите корректное число' };
      }
      if (numValue < 0) {
        return { isValid: false, message: 'Значение не может быть отрицательным' };
      }
      if (question.min !== undefined && numValue < question.min) {
        return { isValid: false, message: `Значение должно быть не меньше ${question.min}` };
      }
      if (question.max !== undefined && numValue > question.max) {
        return { isValid: false, message: `Значение должно быть не больше ${question.max}` };
      }
    }
    
    if (question.type === 'text' || question.type === 'textarea') {
      if (question.id === 'businessGoals' || question.id === 'challenges') {
        const arrayValue = value as string[] | undefined;
        if (!arrayValue || !Array.isArray(arrayValue) || arrayValue.length === 0) {
          return { isValid: false, message: 'Пожалуйста, заполните это поле (минимум одна строка)' };
        }
      } else {
        const stringValue = typeof value === 'string' ? value : (value ? String(value) : '');
        if (!stringValue || stringValue.trim().length === 0) {
          return { isValid: false, message: 'Пожалуйста, заполните это поле' };
        }
      }
    }
    
    if (question.type === 'radio') {
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return { isValid: false, message: 'Пожалуйста, выберите вариант' };
      }
    }
    
    return { isValid: true };
  };

  const currentQuestion = questions[currentStep];
  const currentValue = data[currentQuestion.id as keyof OnboardingData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Добро пожаловать в Академию бизнеса!</CardTitle>
              <CardDescription className="mt-2">
                Ответьте на несколько вопросов, чтобы мы создали персонализированную программу обучения
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">
                Вопрос {currentStep + 1} из {questions.length}
              </div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-4 block">
              {currentQuestion.question}
            </Label>

            {currentQuestion.type === 'text' && (
              <Input
                value={currentValue as string || ''}
                onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full"
              />
            )}

            {currentQuestion.type === 'number' && (
              <Input
                type="number"
                value={currentValue as number || ''}
                onChange={(e) => handleChange(currentQuestion.id, Number(e.target.value))}
                placeholder={currentQuestion.placeholder}
                min={currentQuestion.min}
                max={currentQuestion.max}
                className="w-full"
              />
            )}

            {currentQuestion.type === 'textarea' && (
              <Textarea
                value={currentValue as string || ''}
                onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={5}
                className="w-full"
              />
            )}

            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={currentValue as string || ''}
                onValueChange={(value) => handleChange(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              Назад
            </Button>
            <Button onClick={handleNext}>
              {currentStep === questions.length - 1 ? 'Завершить' : 'Далее'}
              {currentStep < questions.length - 1 && (
                <Icon name="ArrowRight" className="ml-2" size={16} />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

