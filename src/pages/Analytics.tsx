import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Дашборды',
      description: 'Настраиваемые панели с ключевыми метриками вашего бизнеса',
      icon: 'LayoutDashboard',
    },
    {
      title: 'Аналитика сайтов',
      description: 'Детальная статистика по посещениям, конверсиям и поведению пользователей',
      icon: 'Globe',
    },
    {
      title: 'Аналитика ботов',
      description: 'Отслеживание эффективности ботов: сообщения, конверсии, вовлеченность',
      icon: 'Bot',
    },
    {
      title: 'Аналитика рекламы',
      description: 'ROI, CPC, конверсии и эффективность рекламных кампаний',
      icon: 'TrendingUp',
    },
    {
      title: 'Отчеты',
      description: 'Автоматическая генерация отчетов в различных форматах',
      icon: 'FileText',
    },
    {
      title: 'Экспорт данных',
      description: 'Экспорт данных в Excel, CSV, PDF для дальнейшего анализа',
      icon: 'Download',
    },
  ];

  const metrics = [
    'Посещаемость сайтов и ботов',
    'Конверсии и цели',
    'Источники трафика',
    'Поведение пользователей',
    'Эффективность рекламы',
    'Продажи и доходы',
    'Вовлеченность аудитории',
    'География посетителей',
  ];

  const faq = [
    {
      question: 'Какие данные отслеживаются?',
      answer: 'BizForge отслеживает все ключевые метрики: посещаемость сайтов и ботов, конверсии, источники трафика, поведение пользователей, эффективность рекламы, продажи и многое другое. Данные собираются в реальном времени.',
    },
    {
      question: 'Можно ли интегрировать с Google Analytics?',
      answer: 'Да, вы можете подключить Google Analytics и другие аналитические системы. BizForge также может импортировать данные из внешних источников для единой аналитики.',
    },
    {
      question: 'Как часто обновляются данные?',
      answer: 'Данные обновляются в реальном времени. Вы видите актуальную статистику без задержек. Для исторических данных доступны отчеты за любой период.',
    },
    {
      question: 'Можно ли настроить собственные метрики?',
      answer: 'Да, вы можете создавать кастомные метрики и дашборды, настраивать уведомления при достижении определенных показателей и экспортировать данные для анализа.',
    },
    {
      question: 'Есть ли мобильное приложение?',
      answer: 'Аналитика доступна через веб-интерфейс, оптимизированный для мобильных устройств. Вы можете отслеживать метрики с любого устройства.',
    },
    {
      question: 'Как долго хранятся данные?',
      answer: 'Данные хранятся неограниченное время. Вы можете просматривать историю за любой период и сравнивать показатели разных периодов.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Аналитика и статистика</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Полная картина вашего бизнеса в одном месте. Отслеживайте все метрики и принимайте решения на основе данных.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Начать анализировать
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/statistics')}>
                Открыть статистику
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Возможности аналитики</h2>
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

          {/* Metrics */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Отслеживаемые метрики</h2>
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{metric}</span>
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
                  title: 'Единая аналитика',
                  description: 'Все данные в одном месте: сайты, боты, реклама, продажи',
                },
                {
                  title: 'Принятие решений',
                  description: 'Данные в реальном времени помогают быстро реагировать на изменения',
                },
                {
                  title: 'Автоматические отчеты',
                  description: 'Регулярные отчеты на email с ключевыми показателями',
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
              <h2 className="text-3xl font-bold mb-4">Готовы начать анализировать?</h2>
              <p className="text-lg mb-8 opacity-90">
                Создайте аккаунт и получите доступ к полной аналитике вашего бизнеса.
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

export default Analytics;


