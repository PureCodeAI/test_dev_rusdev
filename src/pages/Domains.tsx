import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

const Domains = () => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : null;
  const [searchDomain, setSearchDomain] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: string; name: string; price: number } | null>(null);
  const [myDomains, setMyDomains] = useState<Array<{
    name: string;
    ssl?: boolean;
    expiresIn: string;
  }>>([]);
  const [_loading, setLoading] = useState(false);

  const domains = [
    { zone: '.ru', price: 199, popular: true },
    { zone: '.com', price: 599, popular: true },
    { zone: '.рф', price: 149, popular: false },
    { zone: '.org', price: 899, popular: false },
    { zone: '.net', price: 799, popular: false },
    { zone: '.store', price: 1299, popular: false }
  ];
  const availableDomains = domains;

  const hostingPlans = [
    {
      name: 'Старт',
      price: 99,
      features: ['1 ГБ SSD', '10 ГБ трафика', '1 сайт', 'Базовая поддержка'],
      icon: 'Zap',
      color: 'text-blue-600'
    },
    {
      name: 'Бизнес',
      price: 299,
      features: ['5 ГБ SSD', '50 ГБ трафика', '5 сайтов', 'Приоритетная поддержка', 'SSL бесплатно'],
      icon: 'Rocket',
      color: 'text-purple-600',
      popular: true
    },
    {
      name: 'Премиум',
      price: 599,
      features: ['20 ГБ SSD', 'Безлимитный трафик', 'Безлимит сайтов', '24/7 поддержка', 'SSL бесплатно', 'CDN включен'],
      icon: 'Crown',
      color: 'text-orange-600'
    }
  ];

  const handlePurchase = (type: string, name: string, price: number) => {
    setSelectedItem({ type, name, price });
    setShowPurchaseModal(true);
  };

  const loadDomains = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=domains&action=list&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setMyDomains(data.map((item: Record<string, unknown>) => ({
            name: String(item.domain_name || item.name || ''),
            ssl: Boolean(item.ssl_enabled || item.has_ssl || false),
            expiresIn: item.expires_in || item.expires_at ? 
              (() => {
                const expiresAt = new Date(String(item.expires_at || item.expires_in));
                const now = new Date();
                const diffTime = expiresAt.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? `${diffDays} дней` : 'Истек';
              })() : 'Не указано'
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading domains', error instanceof Error ? error : new Error(String(error)), { userId });
      setMyDomains([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadDomains();
    }
  }, [userId, loadDomains]);

  const confirmPurchase = async () => {
    if (!selectedItem || !userId) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=domains&action=purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          item_type: selectedItem.type,
          item_name: selectedItem.name,
          price: selectedItem.price
        })
      });
      
      if (response.ok) {
        setShowPurchaseModal(false);
        setSelectedItem(null);
        loadDomains();
      }
    } catch (error) {
      logger.error('Error confirming purchase', error instanceof Error ? error : new Error(String(error)), { userId, itemType: selectedItem.type, itemName: selectedItem.name });
    }
    
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Домены и хостинг</h1>
          <p className="text-muted-foreground">Управляйте доменами, SSL-сертификатами и хостингом</p>
        </div>

        <Tabs defaultValue="domains">
          <TabsList>
            <TabsTrigger value="domains">Мои домены</TabsTrigger>
            <TabsTrigger value="buy">Купить домен</TabsTrigger>
            <TabsTrigger value="ssl">SSL-сертификаты</TabsTrigger>
            <TabsTrigger value="hosting">Хостинг</TabsTrigger>
          </TabsList>

          <TabsContent value="domains" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Зарегистрированные домены</CardTitle>
                <CardDescription>У вас {myDomains.length} активных домена</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myDomains.map((domain, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon name="Globe" className="text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-lg">{domain.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Icon name="CheckCircle" size={12} className="mr-1" />
                                  Активен
                                </Badge>
                                {domain.ssl && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Icon name="Shield" size={12} className="mr-1" />
                                    SSL
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">Истекает через {domain.expiresIn}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Icon name="Settings" size={14} className="mr-1" />
                              Настроить
                            </Button>
                            <Button size="sm">
                              <Icon name="RefreshCw" size={14} className="mr-1" />
                              Продлить
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Icon name="Lightbulb" className="text-primary" size={24} />
                  <div>
                    <h3 className="font-semibold mb-2">Автоматическое продление</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Включите автопродление, чтобы не потерять домены. Оплата спишется автоматически за 7 дней до истечения срока.
                    </p>
                    <Button size="sm">Включить автопродление</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buy" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Поиск и регистрация домена</CardTitle>
                <CardDescription>Проверьте доступность домена для вашего бизнеса</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Введите желаемое имя домена..."
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value)}
                    className="flex-1"
                  />
                  <Button>
                    <Icon name="Search" size={16} className="mr-2" />
                    Проверить
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableDomains.map((domain: { zone: string; price: number; popular?: boolean }, i: number) => (
                    <Card key={i} className={domain.popular ? 'border-primary/50' : ''}>
                      <CardContent className="p-4">
                        {domain.popular && (
                          <Badge className="mb-2 bg-primary">Популярный</Badge>
                        )}
                        <div className="text-2xl font-bold mb-2">{domain.zone}</div>
                        <div className="text-3xl font-bold text-primary mb-4">₽{domain.price}<span className="text-sm text-muted-foreground">/год</span></div>
                        <Button
                          className="w-full"
                          variant={domain.popular ? 'default' : 'outline'}
                          onClick={() => handlePurchase('домен', domain.zone, domain.price)}
                        >
                          Купить
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ssl" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Бесплатный SSL</CardTitle>
                  <CardDescription>Let's Encrypt сертификат</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Автоматическое продление</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Установка за 1 клик</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Шифрование 256-бит</span>
                    </div>
                    <div className="text-4xl font-bold text-primary my-4">Бесплатно</div>
                    <Button className="w-full" onClick={() => handlePurchase('SSL', 'Бесплатный SSL', 0)}>
                      Активировать
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/50">
                <CardHeader>
                  <Badge className="w-fit mb-2">Премиум</Badge>
                  <CardTitle>Wildcard SSL</CardTitle>
                  <CardDescription>Для всех поддоменов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Безлимит поддоменов</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Расширенная проверка</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Гарантия до $1,000,000</span>
                    </div>
                    <div className="text-4xl font-bold text-primary my-4">₽2,990<span className="text-sm text-muted-foreground">/год</span></div>
                    <Button className="w-full" onClick={() => handlePurchase('SSL', 'Wildcard SSL', 2990)}>
                      Купить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Icon name="Shield" className="text-yellow-600" size={24} />
                  <div>
                    <h3 className="font-semibold mb-2">Зачем нужен SSL-сертификат?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Защищает данные пользователей при передаче</li>
                      <li>• Повышает доверие к вашему сайту (замок в браузере)</li>
                      <li>• Улучшает позиции в поисковой выдаче Google</li>
                      <li>• Обязателен для приема платежей онлайн</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosting" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {hostingPlans.map((plan, i) => (
                <Card key={i} className={plan.popular ? 'border-primary/50 shadow-lg' : ''}>
                  <CardHeader>
                    {plan.popular && (
                      <Badge className="w-fit mb-2 bg-primary">Популярный</Badge>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={plan.icon} className={plan.color} size={24} />
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      ₽{plan.price}
                      <span className="text-sm text-muted-foreground font-normal">/мес</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Icon name="Check" size={16} className="text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase('хостинг', plan.name, plan.price)}
                    >
                      Выбрать план
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Что включено во все тарифы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Zap" className="text-primary mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">Высокая скорость</div>
                      <div className="text-sm text-muted-foreground">SSD диски и оптимизированные серверы</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Shield" className="text-primary mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">Защита от DDoS</div>
                      <div className="text-sm text-muted-foreground">Автоматическая фильтрация атак</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Database" className="text-primary mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">Ежедневные бэкапы</div>
                      <div className="text-sm text-muted-foreground">Автоматическое сохранение данных</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="HeadphonesIcon" className="text-primary mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">Техподдержка</div>
                      <div className="text-sm text-muted-foreground">Помощь специалистов 24/7</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение покупки</DialogTitle>
            <DialogDescription>
              Вы собираетесь приобрести {selectedItem?.type}: <strong>{selectedItem?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Товар:</span>
                <span className="font-semibold">{selectedItem?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Стоимость:</span>
                <span className="text-2xl font-bold text-primary">
                  {selectedItem?.price === 0 ? 'Бесплатно' : `₽${selectedItem?.price}`}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPurchaseModal(false)}>
                Отмена
              </Button>
              <Button className="flex-1" onClick={confirmPurchase}>
                <Icon name="CreditCard" size={16} className="mr-2" />
                Оплатить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Domains;
