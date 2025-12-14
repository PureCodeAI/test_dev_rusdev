import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Сообщество</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Присоединяйтесь к сообществу предпринимателей и разработчиков
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Icon name="MessageSquare" size={24} className="text-blue-600" />
                </div>
                <CardTitle>Форум</CardTitle>
                <CardDescription>
                  Обсуждайте вопросы, делитесь опытом и находите ответы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                  Присоединиться
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Icon name="Users" size={24} className="text-green-600" />
                </div>
                <CardTitle>Мероприятия</CardTitle>
                <CardDescription>
                  Участвуйте в вебинарах, митапах и конференциях
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                  Посмотреть расписание
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Icon name="BookOpen" size={24} className="text-purple-600" />
                </div>
                <CardTitle>База знаний</CardTitle>
                <CardDescription>
                  Изучайте документацию, руководства и примеры
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                  Открыть базу знаний
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Icon name="Github" size={24} className="text-orange-600" />
                </div>
                <CardTitle>Open Source</CardTitle>
                <CardDescription>
                  Участвуйте в разработке открытых проектов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                  Посмотреть проекты
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Icon name="Award" size={24} className="text-red-600" />
                </div>
                <CardTitle>Программа партнеров</CardTitle>
                <CardDescription>
                  Зарабатывайте, рекомендуя BizForge другим
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                  Стать партнером
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Icon name="Heart" size={24} className="text-yellow-600" />
                </div>
                <CardTitle>Отзывы</CardTitle>
                <CardDescription>
                  Читайте истории успеха наших пользователей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                  Читать отзывы
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Community;


