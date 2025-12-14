import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Advertising = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Таргетированная реклама',
      description: 'Настройка рекламных кампаний с точным таргетингом по аудитории',
      icon: 'Target',
    },
    {
      title: 'Мультиканальность',
      description: 'Запуск рекламы в Яндекс.Директ, Google Ads, ВКонтакте, Telegram',
      icon: 'Radio',
    },
    {
      title: 'Автоматизация',
      description: 'Автоматическое управление ставками и оптимизация кампаний',
      icon: 'Settings',
    },
    {
      title: 'Аналитика в реальном времени',
      description: 'Отслеживание эффективности кампаний и ROI',
      icon: 'TrendingUp',
    },
    {
      title: 'A/B тестирование',
      description: 'Тестирование разных вариантов объявлений для максимальной конверсии',
      icon: 'TestTube',
    },
    {
      title: 'Бюджетное управление',
      description: 'Контроль расходов и автоматическое ограничение бюджета',
      icon: 'Wallet',
    },
  ];

  const platforms = [
    'Яндекс.Директ',
    'Google Ads',
    'ВКонтакте',
    'Telegram Ads',
    'myTarget',
    'РСЯ (Рекламная сеть Яндекса)',
  ];

  const faq = [
    {
      question: 'Какие рекламные платформы поддерживаются?',
      answer: 'BizForge поддерживает интеграцию с основными рекламными платформами: Яндекс.Директ, Google Ads, ВКонтакте, Telegram Ads, myTarget и другими. Вы можете управлять всеми кампаниями из одного интерфейса.',
    },
    {
      question: 'Нужны ли специальные знания для настройки рекламы?',
      answer: 'Нет, наш интерфейс интуитивно понятен. Мы также предоставляем шаблоны кампаний и рекомендации по настройке. Для сложных случаев доступна поддержка специалистов.',
    },
    {
      question: 'Как отслеживается эффективность рекламы?',
      answer: 'Система автоматически собирает данные о кликах, показах, конверсиях и расходах со всех платформ. Вы получаете единую аналитику с детальными отчетами и визуализацией.',
    },
    {
      question: 'Можно ли автоматизировать управление ставками?',
      answer: 'Да, BizForge может автоматически корректировать ставки на основе производительности объявлений. Система анализирует данные и оптимизирует кампании для максимального ROI.',
    },
    {
      question: 'Есть ли ограничения по бюджету?',
      answer: 'Нет, вы можете установить любой бюджет для своих кампаний. Система поможет контролировать расходы и предупредит о достижении лимитов.',
    },
    {
      question: 'Поддерживается ли A/B тестирование?',
      answer: 'Да, вы можете создавать несколько вариантов объявлений и автоматически тестировать их эффективность. Система покажет, какой вариант работает лучше.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Реклама и продвижение</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Управляйте рекламными кампаниями из одного места. Таргетинг, аналитика и автоматизация для максимального ROI.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Начать рекламировать
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/ads')}>
                Открыть панель рекламы
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Возможности платформы</h2>
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

          {/* Platforms */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Поддерживаемые платформы</h2>
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">{platform}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Преимущества</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Экономия времени',
                  description: 'Управление всеми кампаниями из одного интерфейса вместо работы с каждой платформой отдельно',
                },
                {
                  title: 'Увеличение ROI',
                  description: 'Автоматическая оптимизация и аналитика помогают повысить эффективность рекламы',
                },
                {
                  title: 'Контроль бюджета',
                  description: 'Единый контроль расходов и автоматические лимиты предотвращают перерасход',
                },
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
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
              <h2 className="text-3xl font-bold mb-4">Готовы начать рекламировать?</h2>
              <p className="text-lg mb-8 opacity-90">
                Создайте аккаунт и начните управлять рекламными кампаниями уже сегодня.
              </p>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                Начать бесплатно
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Advertising;


