import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const KnowledgeBase = () => {
  const categories = [
    {
      title: 'Начало работы',
      articles: [
        'Регистрация и первый вход',
        'Настройка профиля',
        'Выбор тарифа',
        'Основы работы с платформой',
      ],
      icon: 'PlayCircle',
    },
    {
      title: 'Конструктор сайтов',
      articles: [
        'Создание первого сайта',
        'Работа с шаблонами',
        'Настройка дизайна',
        'Публикация сайта',
        'Подключение домена',
      ],
      icon: 'Globe',
    },
    {
      title: 'Конструктор ботов',
      articles: [
        'Создание бота',
        'Настройка сценариев',
        'Интеграция с мессенджерами',
        'Использование AI',
        'Аналитика ботов',
      ],
      icon: 'Bot',
    },
    {
      title: 'Биржа фриланса',
      articles: [
        'Создание заказа',
        'Подача отклика',
        'Работа с исполнителем',
        'Оплата и гарантии',
        'Отзывы и рейтинги',
      ],
      icon: 'Briefcase',
    },
    {
      title: 'Маркетплейс',
      articles: [
        'Покупка шаблонов',
        'Продажа своих решений',
        'Настройка магазина',
        'Обработка заказов',
      ],
      icon: 'Store',
    },
    {
      title: 'Академия бизнеса',
      articles: [
        'Прохождение онбординга',
        'Обучение на курсах',
        'Сдача тестов',
        'Получение сертификата',
      ],
      icon: 'GraduationCap',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-6xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">База знаний</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Найдите ответы на все вопросы о работе с платформой BizForge
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Поиск по базе знаний..."
                  className="flex-1"
                />
                <Button>
                  <Icon name="Search" className="mr-2" size={18} />
                  Найти
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={category.icon} size={20} className="text-primary" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a href="#" className="text-sm text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                          <Icon name="FileText" size={14} />
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16">
            <Card className="bg-slate-50">
              <CardContent className="p-8 text-center">
                <Icon name="HelpCircle" size={48} className="mx-auto mb-4 text-primary opacity-50" />
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Не нашли ответ?</h2>
                <p className="text-slate-600 mb-6">
                  Обратитесь в нашу службу поддержки, и мы поможем решить ваш вопрос
                </p>
                <Button onClick={() => window.location.href = '/support'}>
                  Связаться с поддержкой
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

export default KnowledgeBase;


