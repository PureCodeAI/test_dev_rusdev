import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

interface DealChatProps {
  dealId: number;
  orderId: number;
  clientId: number;
  freelancerId: number;
  onClose: () => void;
  onDispute?: () => void;
}

interface DealMessage {
  id: number;
  user_id: number;
  message: string;
  attachments: string[];
  is_system: boolean;
  created_at: string;
}

export const DealChat = ({ dealId, orderId, clientId, freelancerId, onClose, onDispute }: DealChatProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id ? Number(user.id) : null;
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasProblems, setHasProblems] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.exchange}?type=exchange&action=deal_messages&deal_id=${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading deal messages', error instanceof Error ? error : new Error(String(error)), { dealId });
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Обновление каждые 5 секунд
    return () => clearInterval(interval);
  }, [dealId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userId || !newMessage.trim()) {
      return;
    }

    try {
      setSending(true);
      const response = await fetch(`${API_ENDPOINTS.exchange}?type=exchange&action=deal_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deal_id: dealId,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
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
      setSending(false);
    }
  };

  const handleReportProblem = () => {
    setHasProblems(true);
    handleSendMessage();
  };

  const handleStartDispute = () => {
    if (window.confirm('Вы уверены, что хотите передать спор в арбитраж? Это действие нельзя отменить.')) {
      onDispute?.();
    }
  };

  const isClient = userId === clientId;
  const isFreelancer = userId === freelancerId;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Чат сделки</DialogTitle>
          <DialogDescription>
            Обсуждение заказа #{orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mt-4 min-h-[400px]">
          {loading ? (
            <div className="text-center py-12">
              <Icon name="RefreshCw" size={32} className="mx-auto mb-2 animate-spin" />
              Загрузка сообщений...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4" />
              <p>Пока нет сообщений</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${message.user_id === userId ? 'bg-primary/10' : ''}`}>
                  <CardContent className="p-4">
                    {message.is_system ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Info" size={16} />
                        <span>{message.message}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {message.user_id === userId ? 'Вы' : message.user_id === clientId ? 'Заказчик' : 'Исполнитель'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((url, idx) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                <Icon name="Paperclip" size={16} className="inline mr-1" />
                                Вложение {idx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t pt-4 space-y-2">
          {hasProblems && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Проблема зафиксирована</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartDispute}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Icon name="Gavel" className="mr-2" size={16} />
                  Передать в арбитраж
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Введите сообщение..."
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                <Icon name="Send" size={16} />
              </Button>
              {!hasProblems && (isClient || isFreelancer) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReportProblem}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Icon name="AlertTriangle" size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

