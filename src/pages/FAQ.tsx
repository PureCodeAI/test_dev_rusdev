import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQ = () => {
  const faqCategories = [
    {
      title: 'Общие вопросы',
      items: [
        {
          question: 'Что такое BizForge?',
          answer: 'BizForge — это комплексная платформа для создания и развития бизнеса в интернете. Мы предоставляем инструменты для создания сайтов, ботов, обучения, рекламы и многое другое.',
        },
        {
          question: 'Сколько стоит использование платформы?',
          answer: 'У нас есть бесплатный тариф с базовыми возможностями. Платные тарифы начинаются от 990 рублей в месяц и открывают дополнительные функции.',
        },
        {
          question: 'Нужны ли технические знания?',
          answer: 'Нет, BizForge разработан для людей без технических знаний. Все инструменты имеют интуитивно понятный интерфейс и подробные инструкции.',
        },
      ],
    },
    {
      title: 'Регистрация и аккаунт',
      items: [
        {
          question: 'Как зарегистрироваться?',
          answer: 'Нажмите кнопку "Начать бесплатно" на главной странице, заполните форму регистрации и подтвердите email.',
        },
        {
          question: 'Можно ли изменить тариф?',
          answer: 'Да, вы можете изменить тариф в любой момент в настройках аккаунта. Изменения вступают в силу немедленно.',
        },
        {
          question: 'Как восстановить пароль?',
          answer: 'На странице входа нажмите "Забыли пароль?" и следуйте инструкциям. Письмо с восстановлением придет на ваш email.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Часто задаваемые вопросы</h1>
            <p className="text-xl text-slate-600">
              Ответы на самые популярные вопросы о платформе BizForge
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-slate-600">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-slate-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Не нашли ответ?</h2>
              <p className="text-slate-600 mb-6">
                Обратитесь в нашу службу поддержки
              </p>
              <a href="/support" className="text-primary hover:underline font-semibold">
                Связаться с поддержкой →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;


