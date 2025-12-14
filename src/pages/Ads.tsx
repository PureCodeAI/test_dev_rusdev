import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logger } from '@/utils/logger';

const Ads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id ? String(user.id) : null;
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Array<{
    id: string;
    name: string;
    platform: string;
    platformIcon: string;
    status: string;
    statusColor: string;
    budget: { spent: number; total: number };
    metrics: { impressions: number; clicks: number; conversions: number; roi: number };
  }>>([]);
  const [packages, setPackages] = useState<Array<{
    id: string;
    name: string;
    price: number;
    popular?: boolean;
    features: string[];
  }>>([]);
  const [agents, setAgents] = useState<Array<{
    id: string;
    name: string;
    photo: string;
    specialty: string;
    status: string;
    rating: number;
    reviews: number;
    activeTasks: number;
  }>>([]);
  const [guides, setGuides] = useState<Array<{
    id: string;
    title: string;
    type: string;
    icon: string;
    duration: string;
    views: number;
  }>>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    text: string;
    time: string;
  }>>([]);
  const [messageInput, setMessageInput] = useState('');

  const loadCampaigns = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=list&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCampaigns(data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.campaign_id),
            name: String(item.name || item.title || 'Кампания'),
            platform: String(item.platform || 'Не указана'),
            platformIcon: String(item.platform_icon || 'Megaphone'),
            status: String(item.status || 'paused'),
            statusColor: String(item.status) === 'active' ? 'bg-green-100 text-green-800' : 
                        String(item.status) === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800',
            budget: {
              spent: Number(item.budget_spent || item.spent || 0),
              total: Number(item.budget_total || item.budget || 0)
            },
            metrics: {
              impressions: Number(item.impressions || 0),
              clicks: Number(item.clicks || 0),
              conversions: Number(item.conversions || 0),
              roi: Number(item.roi || 0)
            }
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading campaigns', error instanceof Error ? error : new Error(String(error || 'Unknown error')), { userId });
      setCampaigns([]);
    }
  }, [userId]);

  const loadPackages = async () => {
    try {
      const defaultPackages = [
        {
          id: '1',
          name: 'Старт',
          price: 4990,
          popular: false,
          features: [
            'Настройка 1 рекламной платформы',
            'Создание 3 креативов',
            'Базовая аналитика',
            'Поддержка 1 месяц'
          ]
        },
        {
          id: '2',
          name: 'Бизнес',
          price: 14990,
          popular: true,
          features: [
            'Настройка 3 рекламных платформ',
            'Создание 10 креативов',
            'Расширенная аналитика',
            'A/B тестирование',
            'Поддержка 3 месяца',
            'Оптимизация кампаний'
          ]
        },
        {
          id: '3',
          name: 'Премиум',
          price: 29990,
          popular: false,
          features: [
            'Настройка всех платформ',
            'Неограниченное количество креативов',
            'Полная аналитика и отчеты',
            'Персональный менеджер',
            'Поддержка 6 месяцев',
            'Автоматическая оптимизация',
            'Консультации по стратегии'
          ]
        }
      ];
      setPackages(defaultPackages);
    } catch (error) {
      logger.error('Error loading packages', error instanceof Error ? error : new Error(String(error)));
      setPackages([]);
    }
  };

  const loadGuides = async () => {
    try {
      const defaultGuides = [
        {
          id: '1',
          title: 'Настройка Яндекс.Директ',
          type: 'video',
          icon: 'Play',
          duration: '15 мин',
          views: 1234
        },
        {
          id: '2',
          title: 'Создание эффективных креативов',
          type: 'checklist',
          icon: 'CheckSquare',
          duration: '10 мин',
          views: 856
        },
        {
          id: '3',
          title: 'Оптимизация бюджета',
          type: 'article',
          icon: 'FileText',
          duration: '8 мин',
          views: 642
        },
        {
          id: '4',
          title: 'A/B тестирование объявлений',
          type: 'video',
          icon: 'Play',
          duration: '20 мин',
          views: 432
        }
      ];
      setGuides(defaultGuides);
    } catch (error) {
      logger.error('Error loading guides', error instanceof Error ? error : new Error(String(error)));
      setGuides([]);
    }
  };

  const loadAgents = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=agents&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAgents(data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.agent_id),
            name: String(item.name || item.full_name || 'Агент'),
            photo: String(item.photo || item.avatar || '👤'),
            specialty: String(item.specialty || item.specialization || 'Маркетолог'),
            status: String(item.status || 'offline'),
            rating: Number(item.rating || 0),
            reviews: Number(item.reviews_count || 0),
            activeTasks: Number(item.active_tasks || 0)
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading agents', error instanceof Error ? error : new Error(String(error)), { userId });
      setAgents([]);
    }
  }, [userId]);

  const loadChatMessages = useCallback(async (agentId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=messages&agent_id=${agentId}&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setChatMessages(data.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.message_id),
            sender: String(item.sender) === 'user' || String(item.user_id) === userId ? 'me' : 'agent',
            text: String(item.text || item.message || ''),
            time: item.created_at ? new Date(String(item.created_at)).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : 'Только что'
          })));
        }
      }
    } catch (error) {
      logger.error('Error loading chat messages', error instanceof Error ? error : new Error(String(error)), { userId, agentId });
      setChatMessages([]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadCampaigns();
      loadPackages();
      loadAgents();
      loadGuides();
    }
  }, [userId, loadCampaigns, loadAgents]);

  useEffect(() => {
    if (selectedAgent) {
      loadChatMessages(selectedAgent);
    }
  }, [selectedAgent, loadChatMessages]);

  const handleEditCampaign = (campaignId: string) => {
    navigate(`/dashboard/ads/edit/${campaignId}`);
  };

  const handleToggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=update_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          user_id: userId,
          status: newStatus
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Кампания ${newStatus === 'active' ? 'запущена' : 'остановлена'}`,
        });
        loadCampaigns();
      } else {
        throw new Error('Failed to update campaign status');
      }
    } catch (error) {
      logger.error('Error toggling campaign status', error instanceof Error ? error : new Error(String(error)), { userId, campaignId });
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус кампании",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту кампанию?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          user_id: userId
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Кампания удалена",
        });
        loadCampaigns();
      } else {
        throw new Error('Failed to delete campaign');
      }
    } catch (error) {
      logger.error('Error deleting campaign', error instanceof Error ? error : new Error(String(error)), { userId, campaignId });
      toast({
        title: "Ошибка",
        description: "Не удалось удалить кампанию",
        variant: "destructive",
      });
    }
  };

  const handleOrderPackage = async (packageId: string, packageName: string, price: number) => {
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Необходима авторизация",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=order_package`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          package_id: packageId,
          package_name: packageName,
          price: price
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Заказ пакета "${packageName}" оформлен`,
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to order package');
      }
    } catch (error) {
      logger.error('Error ordering package', error instanceof Error ? error : new Error(String(error)), { userId, packageId, packageName, price });
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ",
        variant: "destructive",
      });
    }
  };

  const handleOpenChatWithAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    loadChatMessages(agentId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedAgent || !userId) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=ads&action=send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          agent_id: selectedAgent,
          message: messageInput.trim()
        })
      });

      if (response.ok) {
        setMessageInput('');
        loadChatMessages(selectedAgent);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      logger.error('Error sending message', error instanceof Error ? error : new Error(String(error || 'Unknown error')), { userId, agentId: selectedAgent });
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const handleOpenGuide = (guideId: string, guideTitle: string) => {
    navigate(`/dashboard/ads/guides/${guideId}`, { state: { title: guideTitle } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Реклама и продвижение</h1>
            <p className="text-muted-foreground">Управление рекламными кампаниями</p>
          </div>
          <Button onClick={() => navigate('/dashboard/ads/create')}>
            <Icon name="Plus" className="mr-2" size={18} />
            Создать кампанию
          </Button>
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Мои кампании</TabsTrigger>
            <TabsTrigger value="packages">Заказы под ключ</TabsTrigger>
            <TabsTrigger value="agents">Агенты</TabsTrigger>
            <TabsTrigger value="guides">Гайды</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Всего потрачено</span>
                    <Icon name="TrendingUp" size={20} className="text-primary" />
                  </div>
                  <div className="text-3xl font-bold">₽0</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Общий ROI</span>
                    <Icon name="Target" size={20} className="text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">0%</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Конверсии</span>
                    <Icon name="MousePointerClick" size={20} className="text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon name={campaign.platformIcon} size={24} className="text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.platform}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={campaign.statusColor}>
                          {campaign.status === 'active' && 'Активна'}
                          {campaign.status === 'paused' && 'На паузе'}
                          {campaign.status === 'completed' && 'Завершена'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Icon name="MoreVertical" size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCampaign(campaign.id)}>
                              <Icon name="Edit" className="mr-2" size={14} />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}>
                              <Icon name={campaign.status === 'active' ? 'Pause' : 'Play'} className="mr-2" size={14} />
                              {campaign.status === 'active' ? 'Остановить' : 'Запустить'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600"
                            >
                              <Icon name="Trash2" className="mr-2" size={14} />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Бюджет</span>
                          <span className="font-medium">
                            ₽{campaign.budget.spent.toLocaleString()} / ₽{campaign.budget.total.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(campaign.budget.spent / campaign.budget.total) * 100} />
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Показы</div>
                          <div className="text-lg font-semibold">{campaign.metrics.impressions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Клики</div>
                          <div className="text-lg font-semibold">{campaign.metrics.clicks.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Конверсии</div>
                          <div className="text-lg font-semibold">{campaign.metrics.conversions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">ROI</div>
                          <div className="text-lg font-semibold text-green-600">{campaign.metrics.roi}%</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCampaign(campaign.id)}
                        >
                          <Icon name="Edit" className="mr-2" size={14} />
                          Редактировать
                        </Button>
                        {campaign.status === 'active' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                          >
                            <Icon name="Pause" className="mr-2" size={14} />
                            Остановить
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                          >
                            <Icon name="Play" className="mr-2" size={14} />
                            Запустить
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Icon name="Trash2" className="mr-2" size={14} />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6 mt-6">
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>Заказать продвижение под ключ</CardTitle>
                <CardDescription>
                  Профессиональные маркетологи настроят и запустят рекламу за вас
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative ${pkg.popular ? 'border-2 border-primary shadow-lg' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Популярный
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold mt-2">
                      ₽{pkg.price.toLocaleString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Icon name="Check" size={18} className="text-primary mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={pkg.popular ? 'default' : 'outline'}
                      onClick={() => handleOrderPackage(pkg.id, pkg.name, pkg.price)}
                    >
                      Заказать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ваши агенты</CardTitle>
                <CardDescription>Профессиональные маркетологи, работающие над вашими проектами</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedAgent === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
                            {agent.photo}
                          </div>
                          {agent.status === 'online' && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{agent.name}</h4>
                          <p className="text-sm text-muted-foreground">{agent.specialty}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium">{agent.rating}</span>
                              <span className="text-xs text-muted-foreground">({agent.reviews})</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {agent.activeTasks} активных задач
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleOpenChatWithAgent(agent.id)}
                        >
                          <Icon name="MessageSquare" className="mr-2" size={14} />
                          Чат
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedAgent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="MessageSquare" size={20} />
                      Чат с агентом
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-4 h-96 overflow-y-auto">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.sender === 'me'
                                ? 'bg-primary text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Введите сообщение..." 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Icon name="Send" size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Обучающие материалы</CardTitle>
                <CardDescription>Пошаговые инструкции и видео-уроки по настройке рекламы</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {guides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        guide.type === 'video' ? 'bg-red-100' : guide.type === 'checklist' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Icon
                          name={guide.icon}
                          size={24}
                          className={
                            guide.type === 'video' ? 'text-red-600' : guide.type === 'checklist' ? 'text-green-600' : 'text-blue-600'
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{guide.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {guide.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="Eye" size={14} />
                            {guide.views} просмотров
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          onClick={() => handleOpenGuide(guide.id, guide.title)}
                        >
                          Открыть
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Ads;
