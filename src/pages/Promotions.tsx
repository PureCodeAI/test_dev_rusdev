import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Promotions = () => {
  const navigate = useNavigate();

  const promotions = [
    {
      title: 'Скидка 50% на первый месяц',
      description: 'При регистрации получите скидку 50% на любой платный тариф на первый месяц',
      badge: 'Новым пользователям',
      validUntil: 'До 31 января 2025',
    },
    {
      title: 'Бесплатный домен на год',
      description: 'При покупке тарифа "Профессиональный" получите бесплатный домен .ru на год',
      badge: 'Акция',
      validUntil: 'До 28 февраля 2025',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Акции и скидки</h1>
            <p className="text-xl text-slate-600">
              Специальные предложения и выгодные условия для наших пользователей
            </p>
          </div>

          <div className="space-y-6">
            {promotions.map((promo, index) => (
              <Card key={index} className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{promo.title}</CardTitle>
                        <Badge variant="secondary">{promo.badge}</Badge>
                      </div>
                      <p className="text-slate-600">{promo.description}</p>
                      <p className="text-sm text-slate-500 mt-2">{promo.validUntil}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/register')}>
                    Воспользоваться предложением
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

export default Promotions;


