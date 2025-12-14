import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export const MainContent = () => {
  const navigate = useNavigate();
  const forWhoSection = useScrollAnimation();
  const capabilitiesSection = useScrollAnimation();
  const pricingSection = useScrollAnimation();
  const faqSection = useScrollAnimation();

  const capabilities = [
    { icon: 'Globe', title: 'Сайты', desc: 'AI-генерация, конструктор' },
    { icon: 'Bot', title: 'Чат-боты', desc: 'Визуальный редактор' },
    { icon: 'Megaphone', title: 'Реклама', desc: 'Гайды, под ключ' },
    { icon: 'ShoppingBag', title: 'Товары', desc: 'Каталог, маркетплейсы' },
    { icon: 'GraduationCap', title: 'Обучение', desc: 'Курсы, сертификаты' },
    { icon: 'TrendingUp', title: 'Статистика', desc: 'Аналитика, AI-рекомендации' },
    { icon: 'Briefcase', title: 'Биржа', desc: 'Фриланс, услуги' },
    { icon: 'Store', title: 'Маркетплейс', desc: 'Шаблоны, скрипты' },
    { icon: 'Wallet', title: 'Финансы', desc: 'Баланс, банки, бухгалтер' }
  ];

  const faqs = [
    {
      q: 'Нужны ли технические знания?',
      a: 'Нет, платформа полностью визуальная. AI-помощник подскажет на каждом шаге.'
    },
    {
      q: 'Сколько стоит использование?',
      a: 'Есть бесплатный тариф Free. Платные тарифы Pro (₽990/мес) и Premium (₽2990/мес).'
    },
    {
      q: 'Можно ли продавать на маркетплейсе?',
      a: 'Да, интегрируем с Wildberries, Ozon, Яндекс.Маркет автоматически.'
    },
    {
      q: 'Как быстро запущу бизнес?',
      a: 'Минимальное время — несколько часов. Большинство пользователей запускаются за 1-2 дня.'
    },
    {
      q: 'Есть ли поддержка?',
      a: 'Да, круглосуточный AI-консультант + чат с живыми специалистами на платных тарифах.'
    }
  ];

  return (
    <>
      <section 
        ref={forWhoSection.ref}
        className={`container mx-auto px-6 py-20 scroll-animate ${forWhoSection.isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Для кого</h2>
        <p className="text-center text-muted-foreground mb-16 text-lg">Выберите свой путь развития</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="relative p-10 hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer group border-2 hover:border-green-500/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Icon name="TrendingUp" size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Хочу запустить бизнес</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Создавайте сайты, запускайте рекламу, продавайте товары — без программистов и дизайнеров
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-green-600" />
                  </div>
                  <span>Визуальные конструкторы</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-green-600" />
                  </div>
                  <span>AI-помощник для бизнеса</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-green-600" />
                  </div>
                  <span>Автоматизация маркетинга</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg py-6 text-lg" onClick={() => navigate('/register')}>
                Начать бесплатно
                <Icon name="ArrowRight" className="ml-2" size={20} />
              </Button>
            </div>
          </Card>

          <Card className="relative p-10 hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer group border-2 hover:border-purple-500/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Icon name="Code" size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Создаю и продаю</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Находите заказы, продавайте шаблоны и скрипты, зарабатывайте на своих навыках
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-purple-600" />
                  </div>
                  <span>Биржа фриланса с escrow</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-purple-600" />
                  </div>
                  <span>Маркетплейс шаблонов</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={16} className="text-purple-600" />
                  </div>
                  <span>Курсы для роста навыков</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg py-6 text-lg" onClick={() => navigate('/register')}>
                Начать бесплатно
                <Icon name="ArrowRight" className="ml-2" size={20} />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <section 
        id="capabilities" 
        ref={capabilitiesSection.ref}
        className={`container mx-auto px-6 py-16 bg-muted/30 scroll-animate ${capabilitiesSection.isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl font-bold text-center mb-12">Возможности платформы</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {capabilities.map((cap, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <Icon name={cap.icon} size={40} className="mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold mb-2">{cap.title}</h4>
              <p className="text-sm text-muted-foreground">{cap.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section 
        id="pricing" 
        ref={pricingSection.ref}
        className={`container mx-auto px-6 py-16 scroll-animate ${pricingSection.isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl font-bold text-center mb-4">Тарифы</h2>
        <p className="text-center text-muted-foreground mb-12">Подберите план под свои задачи</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
            <Badge className="mb-4">Стартовый</Badge>
            <h3 className="text-3xl font-bold mb-2">Бесплатно</h3>
            <p className="text-muted-foreground mb-6">Для начинающих</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>1 сайт</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>1 чат-бот (до 100 пользователей)</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Базовая статистика</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Сообщество и форум</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
              Начать бесплатно
            </Button>
          </Card>

          <Card className="p-8 border-primary border-2 relative hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary">Популярный</Badge>
            </div>
            <Badge className="mb-4 bg-primary">Бизнес</Badge>
            <h3 className="text-3xl font-bold mb-2">₽990 / мес</h3>
            <p className="text-muted-foreground mb-6">Для растущего бизнеса</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>5 сайтов</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>3 чат-бота (до 1000 пользователей)</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>AI-аналитика и рекомендации</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Интеграции с CRM</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Продажа на маркетплейсе</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Чат-поддержка 24/7</span>
              </li>
            </ul>
            <Button className="w-full bg-primary" onClick={() => navigate('/register')}>
              Попробовать 14 дней бесплатно
            </Button>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600">Премиум</Badge>
            <h3 className="text-3xl font-bold mb-2">₽2990 / мес</h3>
            <p className="text-muted-foreground mb-6">Для профессионалов</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Неограниченно сайтов и ботов</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Приоритетная поддержка</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>White-label решения</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>AI-консультант по росту</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Индивидуальные условия</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Менеджер аккаунта</span>
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => navigate('/register')}>
              Связаться с нами
            </Button>
          </Card>
        </div>
      </section>

      <section 
        ref={faqSection.ref}
        className={`container mx-auto px-6 py-16 bg-muted/30 scroll-animate ${faqSection.isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Готовы начать?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Присоединяйтесь к тысячам предпринимателей, которые уже запустили свой бизнес
        </p>
        <div className="flex gap-4 justify-center items-center flex-wrap">
          <Input 
            placeholder="Ваш email" 
            className="max-w-xs" 
            type="email"
          />
          <Button size="lg" className="bg-primary" onClick={() => navigate('/register')}>
            Начать бесплатно
          </Button>
        </div>
      </section>
    </>
  );
};