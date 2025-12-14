import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const SiteBuilder = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Визуальный редактор',
      description: 'Создавайте сайты перетаскиванием элементов, без знания программирования',
      icon: 'MousePointer2',
    },
    {
      title: 'Готовые шаблоны',
      description: 'Более 100 профессиональных шаблонов для различных типов бизнеса',
      icon: 'Layout',
    },
    {
      title: 'Адаптивный дизайн',
      description: 'Автоматическая адаптация под все устройства: компьютеры, планшеты, смартфоны',
      icon: 'Smartphone',
    },
    {
      title: 'AI-генерация контента',
      description: 'Искусственный интеллект поможет создать тексты, изображения и структуру сайта',
      icon: 'Sparkles',
    },
    {
      title: 'SEO-оптимизация',
      description: 'Встроенные инструменты для продвижения в поисковых системах',
      icon: 'Search',
    },
    {
      title: 'Интеграции',
      description: 'Подключение аналитики, форм обратной связи, онлайн-чатов и платежных систем',
      icon: 'Plug',
    },
  ];

  const capabilities = [
    'Создание лендингов для рекламных кампаний',
    'Разработка корпоративных сайтов',
    'Создание интернет-магазинов',
    'Портфолио для фрилансеров и агентств',
    'Блоги и новостные порталы',
    'Сайты-визитки для малого бизнеса',
    'Многостраничные сайты с каталогами',
    'Промо-страницы для продуктов и услуг',
  ];

  const faq = [
    {
      question: 'Нужны ли знания программирования?',
      answer: 'Нет, конструктор сайтов BizForge разработан специально для людей без технических знаний. Вы можете создать профессиональный сайт, просто перетаскивая элементы и настраивая их через удобный интерфейс.',
    },
    {
      question: 'Сколько времени нужно для создания сайта?',
      answer: 'С простым шаблоном вы можете создать базовый сайт за 15-30 минут. Для более сложных проектов с кастомизацией может потребоваться несколько часов. Все зависит от ваших требований и объема контента.',
    },
    {
      question: 'Можно ли использовать свой домен?',
      answer: 'Да, вы можете подключить свой домен к сайту, созданному в BizForge. Мы поддерживаем все популярные доменные зоны и предоставляем подробные инструкции по настройке.',
    },
    {
      question: 'Есть ли ограничения по количеству страниц?',
      answer: 'На тарифе "Профессиональный" вы можете создать до 50 страниц, на тарифе "Бизнес" - неограниченное количество страниц. На бесплатном тарифе доступно до 5 страниц.',
    },
    {
      question: 'Можно ли экспортировать сайт?',
      answer: 'Да, на платных тарифах доступен экспорт HTML/CSS кода вашего сайта. Вы можете скачать файлы и разместить их на любом хостинге.',
    },
    {
      question: 'Поддерживается ли мультиязычность?',
      answer: 'Да, вы можете создать версии сайта на разных языках. Система автоматически определяет язык посетителя и показывает соответствующую версию.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Конструктор сайтов</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Создавайте профессиональные сайты без программирования. Визуальный редактор, готовые шаблоны и AI-помощник.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Начать создавать сайт
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/editor/site/new')}>
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

          {/* What You Can Create */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Что можно создать</h2>
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{capability}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Как это работает</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Выберите шаблон', description: 'Выберите из 100+ готовых шаблонов или начните с чистого листа' },
                { step: '2', title: 'Настройте дизайн', description: 'Измените цвета, шрифты, изображения под ваш бренд' },
                { step: '3', title: 'Добавьте контент', description: 'Заполните страницы текстом, изображениями и видео' },
                { step: '4', title: 'Опубликуйте', description: 'Опубликуйте сайт одним кликом и получите готовую ссылку' },
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
              <h2 className="text-3xl font-bold mb-4">Готовы создать свой сайт?</h2>
              <p className="text-lg mb-8 opacity-90">
                Начните бесплатно прямо сейчас. Никаких кредитных карт не требуется.
              </p>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                Создать сайт бесплатно
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SiteBuilder;


