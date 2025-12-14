import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Support = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Начало работы',
      questions: [
        'Как зарегистрироваться?',
        'Как создать первый сайт?',
        'Как настроить бота?',
        'Какие есть тарифы?',
      ],
    },
    {
      title: 'Платежи и биллинг',
      questions: [
        'Какие способы оплаты доступны?',
        'Как отменить подписку?',
        'Как получить счет?',
        'Есть ли возврат средств?',
      ],
    },
    {
      title: 'Технические вопросы',
      questions: [
        'Как подключить домен?',
        'Как настроить SSL?',
        'Как работает API?',
        'Какие есть ограничения?',
      ],
    },
    {
      title: 'Безопасность',
      questions: [
        'Как защищены мои данные?',
        'Как настроить двухфакторную аутентификацию?',
        'Что делать при взломе аккаунта?',
        'Как работает резервное копирование?',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Поддержка</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Мы работаем 24/7 и готовы быстро помочь с любым вопросом
            </p>
            
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Введите вопрос и найдите решение"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Icon name="Search" className="mr-2" size={18} />
                  Найти
                </Button>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Мои заявки в поддержку
              </Button>
              <Button size="lg" onClick={() => navigate('/login')}>
                <Icon name="Plus" className="mr-2" size={18} />
                Написать заявку
              </Button>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Популярные статьи</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Ошибки на сайте: причины и способы устранения',
                'Общая информация о персональных данных и правовые основания',
                'Публичная оферта ООО «BizForge»',
                'Как пройти идентификацию',
                'Политика конфиденциальности',
                'Способы оплаты: как выставить и оплатить счёт',
                'Восстановление доступа в личный кабинет',
                'Настройка двухфакторной аутентификации',
              ].map((article, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-slate-50 transition-colors"
                >
                  <p className="text-slate-900 font-medium">{article}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Часто задаваемые вопросы</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqCategories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.questions.map((question, index) => (
                        <li key={index}>
                          <a
                            href="#"
                            className="text-sm text-slate-600 hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <Icon name="ChevronRight" size={16} />
                            {question}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Не нашли ответ?</h2>
              <p className="text-slate-600 mb-6">
                Свяжитесь с нашей службой поддержки, и мы поможем решить ваш вопрос
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  <Icon name="MessageSquare" className="mr-2" size={18} />
                  Онлайн-чат
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  <Icon name="Mail" className="mr-2" size={18} />
                  Email поддержка
                </Button>
                <Button size="lg" onClick={() => navigate('/login')}>
                  <Icon name="Phone" className="mr-2" size={18} />
                  Позвонить
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Support;


