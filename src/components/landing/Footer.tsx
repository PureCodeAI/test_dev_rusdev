import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/components/ui/use-toast';

export const Footer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо дать согласие на получение рекламных материалов',
        variant: 'destructive',
      });
      return;
    }

    if (!email || !email.includes('@')) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный email адрес',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.newsletterSubscribe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'footer',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Вы успешно подписались на рассылку!',
        });
        setEmail('');
        setAgreed(false);
      } else {
        const data = await response.json();
        if (response.status === 409) {
          toast({
            title: 'Информация',
            description: 'Этот email уже подписан на рассылку',
          });
        } else {
          toast({
            title: 'Ошибка',
            description: data.message || 'Не удалось подписаться на рассылку',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200">
      {/* Подписка на рассылку */}
      <section className="border-b border-slate-200 py-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Mail" size={24} className="text-red-500" />
                <h3 className="text-xl font-semibold text-slate-900">Рассылка BizForge</h3>
              </div>
              <p className="text-sm text-slate-600">
                Лайфхаки, скидки и новости об IT
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex-1 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <Input
                  type="email"
                  placeholder="Введите свой email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={!agreed || !email || isSubmitting}>
                  {isSubmitting ? 'Подписка...' : 'Подписаться'}
                  {!isSubmitting && <Icon name="ArrowRight" className="ml-2" size={16} />}
                </Button>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="agreement"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <label htmlFor="agreement" className="text-xs text-slate-600 cursor-pointer">
                  Даю <a href="#" className="text-blue-600 hover:underline">согласие</a> на получение рекламных и информационных материалов
                </label>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Основная навигация */}
      <section className="py-12 border-b border-slate-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <strong className="block text-slate-900 font-semibold mb-4">Продукты</strong>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/site-builder" className="hover:text-primary transition-colors">Конструктор сайтов</a></li>
                <li><a href="/bot-builder" className="hover:text-primary transition-colors">Конструктор ботов</a></li>
                <li><a href="/exchange" className="hover:text-primary transition-colors">Биржа фриланса</a></li>
                <li><a href="/marketplace-landing" className="hover:text-primary transition-colors">Маркетплейс</a></li>
                <li><a href="/university" className="hover:text-primary transition-colors">Академия бизнеса</a></li>
                <li><a href="/advertising" className="hover:text-primary transition-colors">Реклама</a></li>
                <li><a href="/analytics" className="hover:text-primary transition-colors">Статистика</a></li>
              </ul>
            </div>

            <div>
              <strong className="block text-slate-900 font-semibold mb-4">Полезное</strong>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/knowledge-base" className="hover:text-primary transition-colors">База знаний</a></li>
                <li><a href="/documentation" className="hover:text-primary transition-colors">Документация</a></li>
                <li><a href="/payment-methods" className="hover:text-primary transition-colors">Способы оплаты</a></li>
                <li><a href="/partners" className="hover:text-primary transition-colors">Партнерам</a></li>
                <li><a href="/report-violation" className="hover:text-primary transition-colors">Сообщить о нарушении</a></li>
              </ul>
            </div>

            <div>
              <strong className="block text-slate-900 font-semibold mb-4">Компания</strong>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/about" className="hover:text-primary transition-colors">О компании</a></li>
                <li><a href="/contacts" className="hover:text-primary transition-colors">Контакты</a></li>
                <li><a href="/news" className="hover:text-primary transition-colors">Новости</a></li>
                <li><a href="/promotions" className="hover:text-primary transition-colors">Акции и скидки</a></li>
                <li><a href="/blog" className="hover:text-primary transition-colors">Блог</a></li>
                <li><a href="/reviews" className="hover:text-primary transition-colors">Отзывы клиентов</a></li>
              </ul>
            </div>

            <div>
              <strong className="block text-slate-900 font-semibold mb-4">Поддержка</strong>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="/support" className="hover:text-primary transition-colors">Помощь</a></li>
                <li><a href="/faq" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Связаться с нами</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/settings'); }} className="hover:text-primary transition-colors">Настройки</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </section>

      {/* Контакты и соцсети */}
      <section className="py-8 border-b border-slate-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 rounded-lg p-3">
                <a href="tel:+74955801111" className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors">
                  +7 495 580-11-11
                </a>
                <p className="text-xs text-slate-600 mt-1">Телефон в Москве</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" aria-label="VKontakte">
                <Icon name="MessageCircle" size={20} className="text-slate-700" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" aria-label="Telegram">
                <Icon name="Send" size={20} className="text-slate-700" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" aria-label="Odnoklassniki">
                <Icon name="Users" size={20} className="text-slate-700" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" aria-label="YouTube">
                <Icon name="Youtube" size={20} className="text-slate-700" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" aria-label="Twitter">
                <Icon name="Twitter" size={20} className="text-slate-700" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Информация о компании */}
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between gap-8">

            <div className="flex flex-col gap-4 text-sm">
              <div>
                <p className="text-slate-900 font-semibold mb-2">© ООО «BizForge»</p>
              </div>
              <div className="space-y-1 text-slate-600">
                <p>
                  <a href="#" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
                </p>
                <p>
                  <a href="#" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Политика обработки персональных данных</a>
                </p>
                <p>
                  <a href="#" className="text-blue-600 hover:underline">Правила применения рекомендательных технологий</a>
                </p>
                <p>
                  <a href="#" className="text-blue-600 hover:underline">Правила пользования</a>
                </p>
                <p>
                  и другие <a href="#" className="text-blue-600 hover:underline">правила и политики</a>
                </p>
              </div>
              <div className="text-xs text-slate-600 mt-4">
                Нашли опечатку?<br />
                Выделите и нажмите Ctrl+Enter
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};
