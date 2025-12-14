import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Reviews = () => {
  const reviews = [
    {
      name: 'Иван Петров',
      company: 'ООО "ТехноСервис"',
      rating: 5,
      text: 'Отличная платформа! Создал сайт для своей компании за пару часов. Очень удобный интерфейс и много готовых шаблонов.',
      date: '15 января 2025',
    },
    {
      name: 'Мария Сидорова',
      company: 'Интернет-магазин "Мода"',
      rating: 5,
      text: 'Использую BizForge для создания ботов в Telegram. Клиенты в восторге от автоматизации заказов. Рекомендую!',
      date: '12 января 2025',
    },
    {
      name: 'Алексей Козлов',
      company: 'Фрилансер',
      rating: 5,
      text: 'Биржа фриланса помогла найти постоянных клиентов. Удобная система работы и безопасные сделки.',
      date: '10 января 2025',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Отзывы клиентов</h1>
            <p className="text-xl text-slate-600">
              Что говорят о нас наши пользователи
            </p>
          </div>

          <div className="space-y-6">
            {reviews.map((review, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{review.name}</p>
                          <p className="text-sm text-slate-600">{review.company}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700 mb-2">{review.text}</p>
                      <p className="text-sm text-slate-500">{review.date}</p>
                    </div>
                  </div>
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

export default Reviews;


