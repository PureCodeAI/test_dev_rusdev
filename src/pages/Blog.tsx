import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Blog = () => {
  const posts = [
    {
      title: 'Как создать сайт за 30 минут',
      description: 'Пошаговое руководство по созданию первого сайта в BizForge',
      date: '20 января 2025',
      category: 'Руководства',
    },
    {
      title: '10 способов увеличить продажи через бота',
      description: 'Практические советы по использованию ботов для автоматизации продаж',
      date: '18 января 2025',
      category: 'Маркетинг',
    },
    {
      title: 'SEO-оптимизация сайта: основы',
      description: 'Как настроить SEO для вашего сайта и попасть в топ поисковых систем',
      date: '15 января 2025',
      category: 'SEO',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Блог</h1>
            <p className="text-xl text-slate-600">
              Полезные статьи, руководства и советы по развитию бизнеса
            </p>
          </div>

          <div className="space-y-6">
            {posts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary font-semibold">{post.category}</span>
                    <span className="text-sm text-slate-500">{post.date}</span>
                  </div>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{post.description}</CardDescription>
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

export default Blog;


