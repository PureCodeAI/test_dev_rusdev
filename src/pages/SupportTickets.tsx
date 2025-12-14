import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  related_type?: string;
  related_id?: number;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages_count?: number;
  messages?: SupportTicketMessage[];
}

interface SupportTicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  attachments: string[];
  is_internal: boolean;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  exchange_order: 'Заказ на бирже',
  exchange_dispute: 'Спор на бирже',
  technical: 'Техническая проблема',
  billing: 'Биллинг и оплата',
  account: 'Аккаунт',
  other: 'Другое',
};

const statusLabels: Record<string, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  resolved: 'Решено',
  closed: 'Закрыт',
  cancelled: 'Отменен',
};

const priorityLabels: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const SupportTickets = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id ? Number(user.id) : null;
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
    related_type: '',
    related_id: '',
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!userId) {
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const url = new URL(API_ENDPOINTS.supportTickets);
      if (status) url.searchParams.append('status', status);
      url.searchParams.append('user_id', String(userId));
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading tickets', error instanceof Error ? error : new Error(String(error)), { userId });
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тикеты',
        variant: 'destructive',
      });
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab, toast]);

  useEffect(() => {
    loadTickets();
    
    // Проверяем параметры URL для создания тикета из заказа/спора
    const createFromOrder = searchParams.get('create_from_order');
    const createFromDispute = searchParams.get('create_from_dispute');
    
    if (createFromOrder) {
      handleCreateFromOrder(Number(createFromOrder));
      // Удаляем параметр из URL
      searchParams.delete('create_from_order');
      navigate(`/dashboard/support?${searchParams.toString()}`, { replace: true });
    } else if (createFromDispute) {
      handleCreateFromDispute(Number(createFromDispute));
      searchParams.delete('create_from_dispute');
      navigate(`/dashboard/support?${searchParams.toString()}`, { replace: true });
    }
  }, [loadTickets, searchParams, navigate]);

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const url = new URL(API_ENDPOINTS.supportTickets);
      url.searchParams.append('ticket_id', String(ticketId));
      if (userId) url.searchParams.append('user_id', String(userId));
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ticket = await response.json();
      setSelectedTicket(ticket);
      setMessageDialogOpen(true);
    } catch (error) {
      logger.error('Error loading ticket details', error instanceof Error ? error : new Error(String(error)), { ticketId });
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить детали тикета',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTicket = async () => {
    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive',
      });
      return;
    }

    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(API_ENDPOINTS.supportTickets, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          subject: newTicket.subject.trim(),
          description: newTicket.description.trim(),
          category: newTicket.category,
          priority: newTicket.priority,
          related_type: newTicket.related_type || undefined,
          related_id: newTicket.related_id ? Number(newTicket.related_id) : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Тикет создан',
        });
        setCreateDialogOpen(false);
        setNewTicket({
          subject: '',
          description: '',
          category: 'other',
          priority: 'medium',
          related_type: '',
          related_id: '',
        });
        await loadTickets();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка создания тикета');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать тикет',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userId || !selectedTicket || !newMessage.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(API_ENDPOINTS.supportMessages, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Сообщение отправлено',
        });
        setNewMessage('');
        await loadTicketDetails(selectedTicket.id);
        await loadTickets();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка отправки сообщения');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFromOrder = (orderId: number) => {
    setNewTicket({
      subject: `Вопрос по заказу #${orderId}`,
      description: '',
      category: 'exchange_order',
      priority: 'medium',
      related_type: 'exchange_order',
      related_id: String(orderId),
    });
    setCreateDialogOpen(true);
  };

  const handleCreateFromDispute = (disputeId: number) => {
    setNewTicket({
      subject: `Спор #${disputeId}`,
      description: '',
      category: 'exchange_dispute',
      priority: 'high',
      related_type: 'exchange_dispute',
      related_id: String(disputeId),
    });
    setCreateDialogOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    return ticket.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Поддержка</h1>
            <p className="text-muted-foreground">Управление тикетами и обращениями</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Icon name="Plus" className="mr-2" size={18} />
            Создать тикет
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="open">Открытые</TabsTrigger>
            <TabsTrigger value="in_progress">В работе</TabsTrigger>
            <TabsTrigger value="resolved">Решенные</TabsTrigger>
            <TabsTrigger value="closed">Закрытые</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
                Загрузка тикетов...
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Нет тикетов</h3>
                  <p className="text-muted-foreground mb-6">
                    Создайте первый тикет для обращения в поддержку
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>Создать тикет</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => loadTicketDetails(ticket.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{ticket.subject}</h3>
                            <Badge>{categoryLabels[ticket.category] || ticket.category}</Badge>
                            <Badge className={priorityColors[ticket.priority] || priorityColors.medium}>
                              {priorityLabels[ticket.priority] || ticket.priority}
                            </Badge>
                            <Badge variant={ticket.status === 'resolved' || ticket.status === 'closed' ? 'secondary' : 'default'}>
                              {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={16} />
                              <span>{new Date(ticket.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                            {ticket.messages_count !== undefined && (
                              <div className="flex items-center gap-2">
                                <Icon name="MessageSquare" size={16} />
                                <span>{ticket.messages_count} сообщений</span>
                              </div>
                            )}
                            {ticket.related_type && ticket.related_id && (
                              <div className="flex items-center gap-2">
                                <Icon name="Link" size={16} />
                                <span>
                                  {ticket.related_type === 'exchange_order' && `Заказ #${ticket.related_id}`}
                                  {ticket.related_type === 'exchange_dispute' && `Спор #${ticket.related_id}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" onClick={(e) => { e.stopPropagation(); loadTicketDetails(ticket.id); }}>
                          Открыть
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Ticket Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать тикет</DialogTitle>
              <DialogDescription>Опишите вашу проблему или вопрос</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Тема</label>
                <Input
                  placeholder="Краткое описание проблемы"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exchange_order">Заказ на бирже</SelectItem>
                    <SelectItem value="exchange_dispute">Спор на бирже</SelectItem>
                    <SelectItem value="technical">Техническая проблема</SelectItem>
                    <SelectItem value="billing">Биллинг и оплата</SelectItem>
                    <SelectItem value="account">Аккаунт</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Приоритет</label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="urgent">Срочный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Textarea
                  placeholder="Подробно опишите проблему или вопрос"
                  rows={6}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>

              {(newTicket.category === 'exchange_order' || newTicket.category === 'exchange_dispute') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {newTicket.category === 'exchange_order' ? 'ID заказа' : 'ID спора'}
                  </label>
                  <Input
                    type="number"
                    placeholder={newTicket.category === 'exchange_order' ? 'Номер заказа' : 'Номер спора'}
                    value={newTicket.related_id}
                    onChange={(e) => setNewTicket({ ...newTicket, related_id: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTicket} disabled={submitting}>
                  {submitting ? 'Создание...' : 'Создать тикет'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ticket Messages Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTicket?.subject}</DialogTitle>
              <DialogDescription>
                {selectedTicket && (
                  <>
                    <Badge className="mr-2">{categoryLabels[selectedTicket.category] || selectedTicket.category}</Badge>
                    <Badge className={priorityColors[selectedTicket.priority] || priorityColors.medium}>
                      {priorityLabels[selectedTicket.priority] || selectedTicket.priority}
                    </Badge>
                    <Badge variant={selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? 'secondary' : 'default'}>
                      {statusLabels[selectedTicket.status] || selectedTicket.status}
                    </Badge>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-4 mt-4">
                <div className="space-y-4">
                  {selectedTicket.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.user_id === userId
                          ? 'bg-primary/10 ml-auto max-w-[80%]'
                          : 'bg-muted mr-auto max-w-[80%]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {message.user_id === userId ? 'Вы' : 'Поддержка'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Введите сообщение..."
                    rows={3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                      Закрыть
                    </Button>
                    <Button onClick={handleSendMessage} disabled={submitting || !newMessage.trim()}>
                      {submitting ? 'Отправка...' : 'Отправить'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SupportTickets;

