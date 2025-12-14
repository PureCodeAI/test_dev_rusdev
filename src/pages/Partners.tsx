import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Partners = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      title: 'Высокая комиссия',
      description: 'До 30% с каждой продажи по вашей реферальной ссылке',
      icon: 'DollarSign',
    },
    {
      title: 'Готовые материалы',
      description: 'Баннеры, тексты, презентации для продвижения',
      icon: 'Image',
    },
    {
      title: 'Персональный менеджер',
      description: 'Поддержка и консультации от нашего менеджера',
      icon: 'User',
    },
    {
      title: 'Аналитика',
      description: 'Детальная статистика по вашим рефералам',
      icon: 'BarChart3',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Партнерская программа</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Зарабатывайте, рекомендуя BizForge. Высокие комиссии и все инструменты для продвижения.
            </p>
            <Button size="lg" onClick={() => navigate('/register')}>
              Стать партнером
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name={benefit.icon} size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white mb-12">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {[
                  { step: '1', text: 'Зарегистрируйтесь как партнер' },
                  { step: '2', text: 'Получите реферальную ссылку' },
                  { step: '3', text: 'Приглашайте клиентов и получайте комиссию' },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      {item.step}
                    </div>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Условия партнерской программы</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Комиссия выплачивается ежемесячно</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Минимальная сумма вывода: 1000 рублей</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Комиссия начисляется с каждого платежа реферала</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Пожизненная комиссия с каждого клиента</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Partners;


