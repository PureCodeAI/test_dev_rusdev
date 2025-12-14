import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const News = () => {
  const newsItems = [
    {
      title: 'Новые шаблоны для конструктора сайтов',
      date: '15 января 2025',
      description: 'Добавлено 20 новых профессиональных шаблонов для различных типов бизнеса',
    },
    {
      title: 'Интеграция с Telegram Ads',
      description: 'Теперь вы можете запускать рекламу в Telegram прямо из панели BizForge',
      date: '10 января 2025',
    },
    {
      title: 'Обновление Академии бизнеса',
      description: 'Добавлены новые курсы по маркетингу и продажам с AI-консультантом',
      date: '5 января 2025',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Новости</h1>
            <p className="text-xl text-slate-600">
              Следите за обновлениями и новостями платформы BizForge
            </p>
          </div>

          <div className="space-y-6">
            {newsItems.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>{item.title}</CardTitle>
                    <span className="text-sm text-slate-500">{item.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
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

export default News;


