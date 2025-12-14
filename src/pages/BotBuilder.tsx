import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const BotBuilder = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Визуальный редактор',
      description: 'Создавайте ботов с помощью блок-схем, без написания кода',
      icon: 'Workflow',
    },
    {
      title: 'Мультиплатформенность',
      description: 'Один бот для Telegram, WhatsApp, VK и других мессенджеров',
      icon: 'MessageSquare',
    },
    {
      title: 'AI-интеграция',
      description: 'Встроенный AI-помощник для умных ответов и обработки запросов',
      icon: 'Brain',
    },
    {
      title: 'Автоматизация',
      description: 'Автоматизируйте рутинные задачи: бронирование, заказы, консультации',
      icon: 'Zap',
    },
    {
      title: 'Аналитика',
      description: 'Отслеживайте эффективность бота: количество сообщений, конверсии',
      icon: 'BarChart3',
    },
    {
      title: 'Интеграции с CRM',
      description: 'Подключение к популярным CRM-системам для управления клиентами',
      icon: 'Database',
    },
  ];

  const useCases = [
    {
      title: 'Поддержка клиентов',
      description: 'Автоматизируйте ответы на частые вопросы, работайте 24/7',
      icon: 'Headphones',
    },
    {
      title: 'Продажи и заказы',
      description: 'Принимайте заказы, обрабатывайте платежи, отправляйте подтверждения',
      icon: 'ShoppingCart',
    },
    {
      title: 'Бронирование',
      description: 'Автоматическое бронирование столиков, номеров, услуг',
      icon: 'Calendar',
    },
    {
      title: 'Образование',
      description: 'Обучающие боты, тесты, курсы и интерактивные уроки',
      icon: 'GraduationCap',
    },
  ];

  const faq = [
    {
      question: 'Для каких мессенджеров можно создать бота?',
      answer: 'BizForge поддерживает создание ботов для Telegram, WhatsApp, VK, Viber и других популярных мессенджеров. Один бот может работать на нескольких платформах одновременно.',
    },
    {
      question: 'Нужно ли программирование?',
      answer: 'Нет, вы можете создать полнофункционального бота используя визуальный редактор. Просто перетаскивайте блоки и настраивайте логику через удобный интерфейс.',
    },
    {
      question: 'Сколько стоит создание бота?',
      answer: 'Создание бота бесплатно на базовом тарифе. Платные тарифы открывают дополнительные возможности: AI-интеграции, расширенная аналитика, неограниченное количество сообщений.',
    },
    {
      question: 'Можно ли использовать AI в боте?',
      answer: 'Да, в BizForge встроен AI-помощник, который может генерировать ответы, обрабатывать естественный язык и вести интеллектуальные диалоги с пользователями.',
    },
    {
      question: 'Как обрабатываются платежи?',
      answer: 'Бот может принимать платежи через интегрированные платежные системы. Поддерживаются все популярные способы оплаты: карты, электронные кошельки, банковские переводы.',
    },
    {
      question: 'Есть ли ограничения по количеству сообщений?',
      answer: 'На бесплатном тарифе доступно до 1000 сообщений в месяц. На платных тарифах количество сообщений неограниченно.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Конструктор ботов</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Создавайте умных ботов для мессенджеров без программирования. Автоматизируйте общение с клиентами и увеличивайте продажи.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Создать бота
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/editor/bot/new')}>
                Попробовать бесплатно
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Возможности конструктора</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon name={feature.icon} size={24} className="text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Применение ботов</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={useCase.icon} size={24} className="text-primary" />
                      </div>
                      <CardTitle>{useCase.title}</CardTitle>
                    </div>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Как создать бота</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Выберите платформу', description: 'Telegram, WhatsApp, VK или все сразу' },
                { step: '2', title: 'Создайте сценарий', description: 'Используйте визуальный редактор для построения логики бота' },
                { step: '3', title: 'Настройте ответы', description: 'Добавьте тексты, кнопки, медиа и интеграции' },
                { step: '4', title: 'Опубликуйте', description: 'Запустите бота и начните общаться с клиентами' },
              ].map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Часто задаваемые вопросы</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Готовы создать своего бота?</h2>
              <p className="text-lg mb-8 opacity-90">
                Начните бесплатно и автоматизируйте общение с клиентами уже сегодня.
              </p>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                Создать бота бесплатно
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BotBuilder;


