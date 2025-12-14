import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Базовый',
      price: '0',
      period: 'навсегда',
      description: 'Для начинающих предпринимателей',
      features: [
        '1 сайт',
        '1 бот',
        'Базовые шаблоны',
        'Ограниченная поддержка',
        'Базовая аналитика',
      ],
      popular: false,
    },
    {
      name: 'Профессиональный',
      price: '990',
      period: 'в месяц',
      description: 'Для растущего бизнеса',
      features: [
        '5 сайтов',
        '5 ботов',
        'Все шаблоны',
        'Приоритетная поддержка',
        'Расширенная аналитика',
        'Доступ к Академии',
        'Интеграции с CRM',
      ],
      popular: true,
    },
    {
      name: 'Бизнес',
      price: '2990',
      period: 'в месяц',
      description: 'Для крупных компаний',
      features: [
        'Неограниченно сайтов',
        'Неограниченно ботов',
        'Все шаблоны и интеграции',
        'Персональный менеджер',
        'Полная аналитика',
        'Полный доступ к Академии',
        'API доступ',
        'Кастомные интеграции',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Тарифы</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Выберите план, который подходит вашему бизнесу
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative hover:shadow-lg transition-shadow ${
                  plan.popular ? 'border-2 border-primary shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Популярный
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="mb-4">{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price} ₽</span>
                    <span className="text-slate-600">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Icon name="Check" size={16} className="text-green-600 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/register')}
                  >
                    {plan.price === '0' ? 'Начать бесплатно' : 'Выбрать план'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;


