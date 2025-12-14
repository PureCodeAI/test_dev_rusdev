import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { RolesManagement } from '@/components/admin/RolesManagement';
import { UserRolesAssignment } from '@/components/admin/UserRolesAssignment';
import { AccessManagement } from '@/components/admin/AccessManagement';
import { AISettingsTab } from '@/components/admin/AISettingsTab';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMenu, setSelectedMenu] = useState('users');
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [subscribers, setSubscribers] = useState<Array<Record<string, unknown>>>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersTotal, setSubscribersTotal] = useState(0);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.register}?list=true`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    }
  }, [toast]);

  const loadSubscribers = useCallback(async () => {
    try {
      setSubscribersLoading(true);
      const response = await fetch(`${API_ENDPOINTS.newsletterSubscribers}?active_only=true&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);
        setSubscribersTotal(data.total || 0);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить подписчиков",
        variant: "destructive"
      });
    } finally {
      setSubscribersLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedMenu === 'users') {
      loadUsers();
    } else if (selectedMenu === 'newsletter') {
      loadSubscribers();
    }
  }, [selectedMenu, loadUsers, loadSubscribers]);

  const loadFinancialStats = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=admin&action=financial_stats`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setFinancialStats(data.map((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return {
              label: String(typedItem.label || typedItem.name || ''),
              value: String(typedItem.value || typedItem.amount || 0),
              change: typedItem.change || typedItem.change_percent ? String(typedItem.change || typedItem.change_percent) : undefined,
              icon: String(typedItem.icon || 'DollarSign'),
              color: String(typedItem.color || 'text-blue-600')
            };
          }));
        }
      }
    } catch (error) {
      logger.error('Error loading financial stats', error instanceof Error ? error : new Error(String(error || 'Unknown error')));
      setFinancialStats([]);
    }
  };

  const loadPaymentSystems = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=admin&action=payment_systems`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPaymentSystems(data.map((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return {
              id: String(typedItem.id || typedItem.system_id || Date.now()),
              name: String(typedItem.name || typedItem.system_name || 'Система'),
              status: String(typedItem.status || 'active'),
              transactions: Number(typedItem.transactions_count || typedItem.transactions || 0),
              amount: Number(typedItem.total_amount || typedItem.amount || 0),
              commission: String(typedItem.commission || typedItem.commission_rate || '0%')
            };
          }));
        }
      }
    } catch (error) {
      logger.error('Error loading payment systems', error instanceof Error ? error : new Error(String(error)));
      setPaymentSystems([]);
    }
  };

  const loadAiProviders = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.aiUsage}?action=providers`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAiProviders(data.map((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return {
              id: String(typedItem.id || typedItem.provider_id || Date.now()),
              name: String(typedItem.provider_name || typedItem.name || 'Провайдер'),
              usage: Number(typedItem.usage_count || typedItem.requests || 0),
              cost: Number(typedItem.total_cost || typedItem.cost || 0),
              status: String(typedItem.status || 'active')
            };
          }));
        }
      }
    } catch (error) {
      logger.error('Error loading AI providers', error instanceof Error ? error : new Error(String(error)));
      setAiProviders([]);
    }
  };

  const loadPopularFeatures = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=admin&action=popular_features`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPopularFeatures(data.map((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return {
              name: String(typedItem.feature_name || typedItem.name || 'Функция'),
              usage: Number(typedItem.usage_count || typedItem.usage || 0)
            };
          }));
        }
      }
    } catch (error) {
      logger.error('Error loading popular features', error instanceof Error ? error : new Error(String(error)));
      setPopularFeatures([]);
    }
  };

  const [financialStats, setFinancialStats] = useState<Array<{
    label: string;
    value: string;
    change?: string;
  }>>([]);
  const [paymentSystems, setPaymentSystems] = useState<Array<{
    name: string;
    status: string;
    transactions: number;
    amount: number;
  }>>([]);
  const [aiProviders, setAiProviders] = useState<Array<{
    name: string;
    usage: number;
    cost: number;
    status: string;
  }>>([]);
  const [popularFeatures, setPopularFeatures] = useState<Array<{
    name: string;
    usage: number;
  }>>([]);

  useEffect(() => {
    if (selectedMenu === 'finance') {
      loadFinancialStats();
      loadPaymentSystems();
      loadAiProviders();
      loadPopularFeatures();
    }
  }, [selectedMenu]);

  const menuItems = [
    { id: 'users', name: 'Пользователи', icon: 'Users' },
    { id: 'roles', name: 'Роли и доступы', icon: 'Shield' },
    { id: 'ai', name: 'AI настройки', icon: 'Sparkles' },
    { id: 'content', name: 'Контент', icon: 'FileText' },
    { id: 'finance', name: 'Финансы', icon: 'DollarSign' },
    { id: 'system', name: 'Система', icon: 'Settings' },
    { id: 'analytics', name: 'Аналитика', icon: 'BarChart3' },
    { id: 'newsletter', name: 'Рассылка', icon: 'Mail' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <Icon name="Shield" size={24} className="text-primary" />
            <span className="text-lg font-bold text-white">Админ-панель</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                selectedMenu === item.id
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Вернуться
          </Button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        {selectedMenu === 'ai' && (
          <AISettingsTab />
        )}

        {selectedMenu === 'users' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Управление пользователями</h1>
              <p className="text-gray-400">Список всех пользователей платформы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="Users" size={24} className="text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">0</div>
                  <div className="text-sm text-gray-400">Всего пользователей</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="UserCheck" size={24} className="text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">0</div>
                  <div className="text-sm text-gray-400">Активных</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="Crown" size={24} className="text-yellow-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">0</div>
                  <div className="text-sm text-gray-400">Платных</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="UserPlus" size={24} className="text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">0</div>
                  <div className="text-sm text-gray-400">За последний месяц</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Все пользователи</CardTitle>
                    <CardDescription className="text-gray-400">Управление аккаунтами</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Поиск..." className="w-64 bg-gray-900 border-gray-700 text-white" />
                    <Select>
                      <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все роли</SelectItem>
                        <SelectItem value="entrepreneur">Предприниматель</SelectItem>
                        <SelectItem value="freelancer">Фрилансер</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => {
                    const userId = typeof user.id === 'number' ? user.id : Number(user.id) || 0;
                    const userName = String(user.name || '');
                    const userEmail = String(user.email || '');
                    const userStatus = String(user.status || 'inactive');
                    const userTariff = String(user.tariff || '');
                    const userRegistered = String(user.registered || '');
                    return (
                      <div key={userId} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                            {userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{userName}</p>
                            <p className="text-sm text-gray-400">{userEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={userStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {userStatus === 'active' ? 'Активен' : 'Неактивен'}
                          </Badge>
                          <Badge>{userTariff}</Badge>
                          <p className="text-sm text-gray-400">{userRegistered}</p>
                          <Select>
                            <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                              <SelectValue placeholder="Действия" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="edit">Редактировать</SelectItem>
                              <SelectItem value="block">Заблокировать</SelectItem>
                              <SelectItem value="delete">Удалить</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedMenu === 'roles' && (
          <div className="space-y-6">
            <Tabs defaultValue="access" className="space-y-6">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="access">Управление доступом</TabsTrigger>
                <TabsTrigger value="roles">Роли</TabsTrigger>
                <TabsTrigger value="assign">Назначение ролей</TabsTrigger>
              </TabsList>
              
              <TabsContent value="access" className="space-y-4">
                <AccessManagement />
              </TabsContent>
              
              <TabsContent value="roles" className="space-y-4">
                <RolesManagement />
              </TabsContent>
              
              <TabsContent value="assign" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Назначение ролей пользователям</CardTitle>
                    <CardDescription className="text-gray-400">
                      Выберите пользователя из списка для управления его ролями
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {users.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">Загрузка пользователей...</p>
                    ) : (
                      <div className="space-y-3">
                        {users.map((user) => {
                          const userId = typeof user.id === 'number' ? user.id : Number(user.id) || 0;
                          const userFullName = String(user.full_name || user.name || 'Пользователь');
                          const userEmail = String(user.email || 'Нет email');
                          const userInitial = (userFullName || String(user.email || 'U')).charAt(0).toUpperCase();
                          return (
                            <div key={userId} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                                  {userInitial}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{userFullName}</p>
                                  <p className="text-sm text-gray-400">{userEmail}</p>
                                </div>
                              </div>
                              <UserRolesAssignment 
                                user={user ? { 
                                  id: typeof user.id === 'number' ? user.id : Number(user.id) || 0,
                                  full_name: String(user.full_name || user.name || 'Пользователь'),
                                  email: String(user.email || ''),
                                  user_type: String(user.user_type || user.userType || 'user')
                                } : null} 
                                onUpdate={() => {
                                  loadUsers();
                                }} 
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {selectedMenu === 'finance' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Финансы</h1>
              <p className="text-gray-400">Финансовая отчетность платформы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {financialStats.map((stat, index) => {
                const typedStat = stat as { label: string; value: string; change?: string; icon?: string; color?: string };
                return (
                  <Card key={index} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Icon name={(typedStat.icon as string | undefined) || 'DollarSign'} size={24} className={typedStat.color || 'text-blue-600'} />
                      <Badge className="bg-green-100 text-green-700">{stat.change}</Badge>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-white">{typedStat.value}</div>
                    <div className="text-sm text-gray-400">{typedStat.label}</div>
                  </CardContent>
                </Card>
                );
              })}
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Транзакции</CardTitle>
                <CardDescription className="text-gray-400">История всех операций</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Таблица транзакций...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedMenu === 'system' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Настройка системы</h1>
              <p className="text-gray-400">Управление платежами, AI и доступами</p>
            </div>

            <Tabs defaultValue="payments" className="space-y-6">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="payments">Платежи</TabsTrigger>
                <TabsTrigger value="ai">AI-модели</TabsTrigger>
                <TabsTrigger value="access">Доступы</TabsTrigger>
                <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Платежные системы</CardTitle>
                    <CardDescription className="text-gray-400">Управление интеграциями</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {paymentSystems.map((system, index) => {
                      const typedSystem = system as { id?: string; name: string; status: string; transactions: number; amount: number; commission?: string };
                      return (
                        <div key={typedSystem.id || `system-${index}`} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name="CreditCard" size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{typedSystem.name}</p>
                            <p className="text-sm text-gray-400">Комиссия: {typedSystem.commission || '0%'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={typedSystem.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {typedSystem.status === 'active' ? 'Активна' : 'Неактивна'}
                          </Badge>
                          <Button size="sm" variant="outline">Настроить</Button>
                        </div>
                      </div>
                      );
                    })}
                    <Button className="w-full">
                      <Icon name="Plus" className="mr-2" size={16} />
                      Добавить платежную систему
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">AI-провайдеры</CardTitle>
                    <CardDescription className="text-gray-400">Управление API-ключами и моделями</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiProviders.map((provider, index) => {
                      const typedProvider = provider as { id?: string; name: string; usage: number; cost: number; status: string };
                      return (
                        <div key={typedProvider.id || `provider-${index}`} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon name="Sparkles" size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{typedProvider.name}</p>
                              <p className="text-sm text-gray-400">{typedProvider.cost} • Использовано: {typedProvider.usage}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={typedProvider.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {typedProvider.status === 'active' ? 'Активна' : 'Неактивна'}
                            </Badge>
                            <Button size="sm" variant="outline">Настроить</Button>
                          </div>
                        </div>
                      );
                    })}
                    <Button className="w-full">
                      <Icon name="Plus" className="mr-2" size={16} />
                      Добавить AI-провайдера
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="access" className="space-y-4">
                <AccessManagement />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {selectedMenu === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Аналитика</h1>
              <p className="text-gray-400">Ключевые метрики платформы</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Выручка (MRR)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2 text-white">₽0</div>
                  <Badge className="bg-gray-100 text-gray-700">Нет данных</Badge>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Конверсия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2 text-white">0%</div>
                  <Badge className="bg-gray-100 text-gray-700">Нет данных</Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Популярные функции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white">{feature.name}</span>
                      <Badge>{feature.usage} использований</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedMenu === 'newsletter' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Рассылка</h1>
              <p className="text-gray-400">Управление подписчиками на рассылку</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="Mail" size={24} className="text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">{subscribersTotal}</div>
                  <div className="text-sm text-gray-400">Всего подписчиков</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="UserCheck" size={24} className="text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">
                    {subscribers.filter(s => Boolean(s.is_active)).length}
                  </div>
                  <div className="text-sm text-gray-400">Активных</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon name="TrendingUp" size={24} className="text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-white">
                    {subscribers.filter(s => {
                      const subDate = new Date(String(s.subscribed_at || ''));
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return subDate >= monthAgo;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-400">За последний месяц</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Список подписчиков</CardTitle>
                    <CardDescription className="text-gray-400">
                      Все email адреса, давшие согласие на рассылку
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Поиск по email..." 
                      className="w-64 bg-gray-900 border-gray-700 text-white" 
                    />
                    <Button 
                      variant="outline" 
                      onClick={loadSubscribers}
                      disabled={subscribersLoading}
                    >
                      <Icon name="RefreshCw" className="mr-2" size={16} />
                      Обновить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subscribersLoading ? (
                  <div className="text-center py-8">
                    <Icon name="Loader2" size={32} className="mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-gray-400">Загрузка подписчиков...</p>
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Mail" size={48} className="mx-auto mb-4 text-gray-600 opacity-50" />
                    <p className="text-gray-400">Нет подписчиков</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 p-3 border-b border-gray-700 text-sm font-semibold text-gray-400">
                      <div className="col-span-4">Email</div>
                      <div className="col-span-2">Источник</div>
                      <div className="col-span-2">Дата подписки</div>
                      <div className="col-span-2">IP адрес</div>
                      <div className="col-span-2">Статус</div>
                    </div>
                    {subscribers.map((subscriber) => {
                      const subscriberId = typeof subscriber.id === 'number' ? subscriber.id : Number(subscriber.id) || 0;
                      const subscriberEmail = String(subscriber.email || '');
                      const subscriberUserId = subscriber.user_id ? String(subscriber.user_id) : null;
                      const subscriberSource = String(subscriber.source || 'footer');
                      const subscriberSubscribedAt = String(subscriber.subscribed_at || '');
                      const subscriberIpAddress = String(subscriber.ip_address || 'N/A');
                      return (
                        <div 
                          key={subscriberId} 
                          className="grid grid-cols-12 gap-4 p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="col-span-4">
                            <p className="text-white font-medium">{subscriberEmail}</p>
                            {subscriberUserId && (
                              <p className="text-xs text-gray-500">ID пользователя: {subscriberUserId}</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {subscriberSource}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-400">
                              {subscriberSubscribedAt ? new Date(subscriberSubscribedAt).toLocaleString('ru-RU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Не указано'}
                            </p>
                          </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-400 font-mono">
                            {subscriberIpAddress}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <Badge 
                            className={subscriber.is_active
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {subscriber.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
