import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface HelpAndLearningProps {
  onClose?: () => void;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    target?: string;
  }>;
  duration: string;
  category: string;
}

interface VideoInstruction {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  category: string;
}

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  category: string;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Начало работы',
    description: 'Быстрый старт с конструктором сайтов',
    steps: [
      { title: 'Создание первого блока', description: 'Перетащите блок из панели слева на холст' },
      { title: 'Редактирование контента', description: 'Кликните на блок для редактирования' },
      { title: 'Настройка стилей', description: 'Используйте панель справа для изменения стилей' },
      { title: 'Публикация сайта', description: 'Нажмите "Опубликовать" для деплоя сайта' }
    ],
    duration: '5 минут',
    category: 'Основы'
  },
  {
    id: 'blocks',
    title: 'Работа с блоками',
    description: 'Управление блоками на странице',
    steps: [
      { title: 'Добавление блоков', description: 'Перетащите блок из панели на холст' },
      { title: 'Выбор блоков', description: 'Кликните на блок для выбора' },
      { title: 'Перемещение блоков', description: 'Перетащите блок для изменения позиции' },
      { title: 'Удаление блоков', description: 'Нажмите Delete или используйте контекстное меню' }
    ],
    duration: '7 минут',
    category: 'Блоки'
  },
  {
    id: 'styling',
    title: 'Стилизация',
    description: 'Настройка внешнего вида элементов',
    steps: [
      { title: 'Цвета и шрифты', description: 'Используйте вкладку "Стили" в панели справа' },
      { title: 'Отступы и размеры', description: 'Настройте padding, margin и размеры' },
      { title: 'Адаптивность', description: 'Настройте стили для разных устройств' },
      { title: 'Анимации', description: 'Добавьте анимации появления и hover эффекты' }
    ],
    duration: '10 минут',
    category: 'Дизайн'
  },
  {
    id: 'pages',
    title: 'Управление страницами',
    description: 'Создание и настройка страниц',
    steps: [
      { title: 'Создание страницы', description: 'Используйте менеджер страниц в левой панели' },
      { title: 'Настройка страницы', description: 'Установите название, путь и метаданные' },
      { title: 'Навигация', description: 'Создайте меню для навигации между страницами' },
      { title: 'Домашняя страница', description: 'Установите главную страницу сайта' }
    ],
    duration: '8 минут',
    category: 'Страницы'
  },
  {
    id: 'publishing',
    title: 'Публикация сайта',
    description: 'Деплой сайта на поддомен или собственный домен',
    steps: [
      { title: 'Выбор домена', description: 'Выберите поддомен или подключите свой домен' },
      { title: 'Настройка SSL', description: 'Включите автоматический SSL сертификат' },
      { title: 'Публикация', description: 'Нажмите "Опубликовать" и дождитесь завершения' },
      { title: 'Проверка', description: 'Откройте опубликованный сайт в браузере' }
    ],
    duration: '12 минут',
    category: 'Публикация'
  }
];

const VIDEO_INSTRUCTIONS: VideoInstruction[] = [
  {
    id: 'intro',
    title: 'Введение в конструктор',
    description: 'Обзор основных возможностей конструктора',
    url: 'https://example.com/video/intro',
    duration: '15:30',
    category: 'Основы'
  },
  {
    id: 'blocks-basics',
    title: 'Работа с блоками',
    description: 'Как добавлять и редактировать блоки',
    url: 'https://example.com/video/blocks',
    duration: '12:45',
    category: 'Блоки'
  },
  {
    id: 'styling',
    title: 'Стилизация элементов',
    description: 'Настройка цветов, шрифтов и отступов',
    url: 'https://example.com/video/styling',
    duration: '18:20',
    category: 'Дизайн'
  },
  {
    id: 'responsive',
    title: 'Адаптивный дизайн',
    description: 'Создание адаптивных сайтов',
    url: 'https://example.com/video/responsive',
    duration: '20:15',
    category: 'Дизайн'
  },
  {
    id: 'forms',
    title: 'Работа с формами',
    description: 'Создание и настройка форм',
    url: 'https://example.com/video/forms',
    duration: '14:30',
    category: 'Формы'
  },
  {
    id: 'integrations',
    title: 'Интеграции',
    description: 'Подключение платежей, CRM и других сервисов',
    url: 'https://example.com/video/integrations',
    duration: '25:00',
    category: 'Интеграции'
  },
  {
    id: 'publishing',
    title: 'Публикация сайта',
    description: 'Как опубликовать сайт на поддомен или свой домен',
    url: 'https://example.com/video/publishing',
    duration: '16:45',
    category: 'Публикация'
  }
];

const DOCUMENTATION: DocumentationSection[] = [
  {
    id: 'overview',
    title: 'Обзор конструктора',
    content: 'Конструктор сайтов позволяет создавать профессиональные веб-сайты без знания программирования. Используйте блоки для добавления контента, настраивайте стили и публикуйте сайт одним кликом.',
    category: 'Основы'
  },
  {
    id: 'blocks',
    title: 'Блоки',
    content: 'Блоки - это основные элементы страницы. Вы можете добавлять блоки из панели слева, редактировать их содержимое и стили, перемещать и удалять. Доступно более 200 различных блоков для всех типов контента.',
    category: 'Блоки'
  },
  {
    id: 'styling',
    title: 'Стилизация',
    content: 'Используйте панель свойств справа для настройки стилей блоков. Вы можете изменять цвета, шрифты, отступы, размеры, добавлять анимации и hover эффекты. Все изменения применяются мгновенно.',
    category: 'Дизайн'
  },
  {
    id: 'responsive',
    title: 'Адаптивный дизайн',
    content: 'Настройте стили для разных устройств: desktop, tablet, mobile. Используйте вкладку "Адаптив" в панели свойств для настройки стилей для каждого типа устройств.',
    category: 'Дизайн'
  },
  {
    id: 'pages',
    title: 'Страницы',
    content: 'Создавайте неограниченное количество страниц для вашего сайта. Управляйте страницами через менеджер страниц, настраивайте пути, метаданные и создавайте навигацию.',
    category: 'Страницы'
  },
  {
    id: 'templates',
    title: 'Шаблоны',
    content: 'Используйте готовые шаблоны для быстрого старта. Выберите шаблон из библиотеки и адаптируйте его под свои нужды. Сохраняйте свои секции и блоки как шаблоны для повторного использования.',
    category: 'Шаблоны'
  },
  {
    id: 'integrations',
    title: 'Интеграции',
    content: 'Подключайте платежные системы, CRM, базы данных, мессенджеры, аналитику и другие сервисы. Все интеграции настраиваются через панель свойств блока.',
    category: 'Интеграции'
  },
  {
    id: 'publishing',
    title: 'Публикация',
    content: 'Публикуйте сайт на поддомене (например, mysite.rus.dev) или подключите собственный домен. SSL сертификат настраивается автоматически. Доступен мониторинг и логи.',
    category: 'Публикация'
  }
];

export const HelpAndLearning = ({ onClose }: HelpAndLearningProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'tutorials' | 'videos' | 'docs' | 'onboarding'>('tutorials');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingStarted, setOnboardingStarted] = useState(false);

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    toast({
      title: "Туториал начат",
      description: `Начинаем туториал "${tutorial.title}"`
    });
  };

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    if (selectedTutorial) {
      toast({
        title: "Туториал завершен",
        description: `Туториал "${selectedTutorial.title}" успешно пройден`
      });
      setSelectedTutorial(null);
      setCurrentStep(0);
    }
  };

  const startOnboarding = () => {
    setOnboardingStarted(true);
    setActiveTab('onboarding');
    toast({
      title: "Приветственный тур",
      description: "Добро пожаловать! Давайте начнем с основ"
    });
  };

  const playVideo = (video: VideoInstruction) => {
    window.open(video.url, '_blank');
    toast({
      title: "Видео открыто",
      description: `Открыто видео "${video.title}" в новой вкладке`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Icon name="HelpCircle" size={20} className="text-primary" />
            Помощь и обучение
          </h3>
          <p className="text-sm text-muted-foreground">
            Туториалы, видео инструкции и документация
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        )}
      </div>

      {!selectedTutorial && !onboardingStarted && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tutorials">Туториалы</TabsTrigger>
            <TabsTrigger value="videos">Видео</TabsTrigger>
            <TabsTrigger value="docs">Документация</TabsTrigger>
            <TabsTrigger value="onboarding">Онбординг</TabsTrigger>
          </TabsList>

          <TabsContent value="tutorials" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TUTORIALS.map(tutorial => (
                <Card key={tutorial.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{tutorial.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tutorial.description}</p>
                    </div>
                    <Badge variant="outline">{tutorial.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      <Icon name="Clock" size={12} className="inline mr-1" />
                      {tutorial.duration}
                    </span>
                    <Button size="sm" onClick={() => startTutorial(tutorial)}>
                      <Icon name="Play" size={14} className="mr-2" />
                      Начать
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIDEO_INSTRUCTIONS.map(video => (
                <Card key={video.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{video.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                    </div>
                    <Badge variant="outline">{video.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      <Icon name="Clock" size={12} className="inline mr-1" />
                      {video.duration}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => playVideo(video)}>
                      <Icon name="Play" size={14} className="mr-2" />
                      Смотреть
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4 mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {DOCUMENTATION.map(doc => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{doc.title}</h4>
                      <Badge variant="outline">{doc.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{doc.content}</p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-4 mt-4">
            <Card className="p-6 text-center">
              <Icon name="Rocket" size={48} className="mx-auto mb-4 text-primary" />
              <h4 className="font-semibold text-lg mb-2">Приветственный тур</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Пройдите пошаговый тур по конструктору и узнайте основные возможности
              </p>
              <Button onClick={startOnboarding} className="w-full">
                <Icon name="Play" size={16} className="mr-2" />
                Начать тур
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Примеры использования</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Icon name="Globe" size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Создание лендинга</p>
                    <p className="text-xs text-muted-foreground">Одностраничный сайт для продукта или услуги</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Icon name="ShoppingBag" size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Интернет-магазин</p>
                    <p className="text-xs text-muted-foreground">Создание каталога товаров с корзиной</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Корпоративный сайт</p>
                    <p className="text-xs text-muted-foreground">Многостраничный сайт компании</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Icon name="Users" size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Портфолио</p>
                    <p className="text-xs text-muted-foreground">Демонстрация работ и услуг</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {selectedTutorial && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">{selectedTutorial.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedTutorial.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTutorial(null)}>
              <Icon name="X" size={16} />
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Шаг {currentStep + 1} из {selectedTutorial.steps.length}
              </span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentStep + 1) / selectedTutorial.steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <Card className="p-4 bg-muted/50">
              <h5 className="font-semibold mb-2">
                {selectedTutorial.steps[currentStep].title}
              </h5>
              <p className="text-sm text-muted-foreground">
                {selectedTutorial.steps[currentStep].description}
              </p>
              {selectedTutorial.steps[currentStep].target && (
                <p className="text-xs text-muted-foreground mt-2">
                  <Icon name="MousePointerClick" size={12} className="inline mr-1" />
                  Нажмите на элемент: {selectedTutorial.steps[currentStep].target}
                </p>
              )}
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <Icon name="ChevronLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <Button onClick={nextStep}>
                {currentStep < selectedTutorial.steps.length - 1 ? (
                  <>
                    Далее
                    <Icon name="ChevronRight" size={16} className="ml-2" />
                  </>
                ) : (
                  <>
                    Завершить
                    <Icon name="Check" size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {onboardingStarted && !selectedTutorial && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">Приветственный тур</h4>
              <p className="text-sm text-muted-foreground">Пошаговое знакомство с конструктором</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOnboardingStarted(false)}>
              <Icon name="X" size={16} />
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={24} className="text-primary mt-1" />
                <div className="flex-1">
                  <h5 className="font-semibold mb-2">Добро пожаловать в конструктор сайтов!</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Этот тур поможет вам быстро освоить основные возможности конструктора.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-500" />
                      <span>Панель блоков слева - добавление элементов на страницу</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-500" />
                      <span>Холст в центре - рабочая область для редактирования</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-500" />
                      <span>Панель свойств справа - настройка выбранного элемента</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Icon name="MousePointerClick" size={32} className="mx-auto mb-2 text-primary" />
                <h5 className="font-semibold mb-1">1. Добавьте блок</h5>
                <p className="text-xs text-muted-foreground">
                  Перетащите блок из панели слева на холст
                </p>
              </Card>
              <Card className="p-4 text-center">
                <Icon name="Edit" size={32} className="mx-auto mb-2 text-primary" />
                <h5 className="font-semibold mb-1">2. Отредактируйте</h5>
                <p className="text-xs text-muted-foreground">
                  Кликните на блок и измените контент в панели справа
                </p>
              </Card>
              <Card className="p-4 text-center">
                <Icon name="Rocket" size={32} className="mx-auto mb-2 text-primary" />
                <h5 className="font-semibold mb-1">3. Опубликуйте</h5>
                <p className="text-xs text-muted-foreground">
                  Нажмите "Опубликовать" для деплоя сайта
                </p>
              </Card>
            </div>

            <Button onClick={() => setOnboardingStarted(false)} className="w-full">
              <Icon name="Check" size={16} className="mr-2" />
              Понятно, начать работу
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

