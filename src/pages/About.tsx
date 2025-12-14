import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const About = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">О компании BizForge</h1>
            <p className="text-xl text-slate-600">
              Мы помогаем предпринимателям создавать и развивать бизнес в цифровом мире
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Наша миссия</h2>
                <p className="text-slate-600 leading-relaxed">
                  BizForge — это комплексная платформа для создания и развития бизнеса в интернете. 
                  Мы предоставляем все необходимые инструменты: от создания сайтов и ботов до обучения 
                  и автоматизации бизнес-процессов. Наша цель — сделать цифровые технологии доступными 
                  для каждого предпринимателя, независимо от уровня технических знаний.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Что мы предлагаем</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Конструктор сайтов без программирования',
                    'Создание ботов для мессенджеров',
                    'Биржа фриланса для поиска исполнителей',
                    'Маркетплейс готовых решений',
                    'Академия бизнеса с AI-обучением',
                    'Инструменты для рекламы и аналитики',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Наши достижения</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { number: '10,000+', label: 'Пользователей' },
                    { number: '50,000+', label: 'Созданных сайтов' },
                    { number: '5,000+', label: 'Активных ботов' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                      <div className="text-slate-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;


