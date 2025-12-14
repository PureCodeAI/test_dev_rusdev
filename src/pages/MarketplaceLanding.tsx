import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const MarketplaceLanding = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Шаблоны сайтов',
      description: 'Готовые решения для различных типов бизнеса',
      icon: 'Globe',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      items: ['Корпоративные сайты', 'Интернет-магазины', 'Лендинги', 'Портфолио'],
    },
    {
      title: 'Готовые боты',
      description: 'Преднастроенные боты для популярных задач',
      icon: 'Bot',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      items: ['Чат-боты поддержки', 'Боты для продаж', 'Онлайн-консультанты', 'Автоматизация'],
    },
    {
      title: 'Интеграции',
      description: 'Готовые подключения к популярным сервисам',
      icon: 'Plug',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      items: ['CRM системы', 'Платежные системы', 'Email-сервисы', 'Социальные сети'],
    },
    {
      title: 'Расширения',
      description: 'Дополнительные функции и возможности',
      icon: 'Puzzle',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      items: ['Виджеты', 'Плагины', 'Модули', 'API-интеграции'],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Маркетплейс</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Покупайте и продавайте готовые решения для вашего бизнеса
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                Начать продавать
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/marketplace')}>
                Посмотреть каталог
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {categories.map((category) => (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-4`}>
                    <Icon name={category.icon} size={24} className={category.iconColor} />
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="Check" size={16} className="text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Станьте продавцом</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Продавайте свои шаблоны, боты и интеграции в нашем маркетплейсе. 
              Получайте пассивный доход от ваших разработок.
            </p>
            <Button size="lg" onClick={() => navigate('/register')}>
              Зарегистрироваться как продавец
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceLanding;

