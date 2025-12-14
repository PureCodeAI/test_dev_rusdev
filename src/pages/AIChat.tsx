import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { sendChatMessage, loadUserChatPreferences, saveUserChatPreferences } from '@/services/aiService';
import { logger } from '@/utils/logger';
import { usePermissions } from '@/hooks/usePermissions';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

const modes = [
  { id: 'universal', name: 'Универсальный', icon: 'Bot', color: 'bg-primary', description: 'Помощь в различных вопросах' },
  { id: 'site', name: 'Помощь с сайтом', icon: 'Globe', color: 'bg-secondary', description: 'Техническая поддержка и разработка' },
  { id: 'ads', name: 'Консультант по рекламе', icon: 'Megaphone', color: 'bg-orange-500', description: 'Рекламные кампании и аналитика' },
  { id: 'accountant', name: 'Бухгалтер', icon: 'Calculator', color: 'bg-green-500', description: 'Налоги, отчетность, финансы' },
];

const quickActions = [
  { id: 'landing', title: 'ТЗ для лендинга', prompt: 'Составь ТЗ для лендинга...' },
  { id: 'ads', title: 'Идеи для рекламы', prompt: 'Дай 5 идей для рекламных креативов...' },
  { id: 'seo', title: 'SEO чек-лист', prompt: 'Сформируй базовый SEO чек-лист...' },
];

const AIChat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [activeMode, setActiveMode] = useState<'universal' | 'site' | 'ads' | 'accountant'>('universal');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRules, setUserRules] = useState('');
  const [userName, setUserName] = useState('');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadChatData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Загружаем историю
      const historyResponse = await fetch(
        `${API_ENDPOINTS.blocks}?type=ai_chat&action=get_history&chat_type=${activeMode}&user_id=${user.id}`
      );
      
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages.map((msg: { content: string; role: string; timestamp: string; id?: string }) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            role: msg.role as 'user' | 'assistant',
            text: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          })));
        }
      }
      
      // Загружаем настройки пользователя
      const preferences = await loadUserChatPreferences(user.id, activeMode);
      if (preferences) {
        setUserRules(preferences.userRules || '');
        setUserName(preferences.userName || '');
      }
    } catch (error) {
      logger.error('Error loading chat data', error instanceof Error ? error : new Error(String(error)));
    }
  }, [activeMode, user?.id]);

  useEffect(() => {
    loadChatData();
  }, [activeMode, user?.id, loadChatData]);

  const saveChatHistory = async (newMessages: ChatMessage[]) => {
    if (!user?.id) return;
    
    try {
      await fetch(`${API_ENDPOINTS.blocks}?type=ai_chat&action=save_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id),
        },
        body: JSON.stringify({
          chat_type: activeMode,
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.text,
            timestamp: new Date().toISOString(),
          })),
          user_rules: userRules || undefined,
        }),
      });
    } catch (error) {
      logger.error('Error saving chat history', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    if (!user?.id) {
      toast({ title: 'Ошибка', description: 'Требуется авторизация', variant: 'destructive' });
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: message.trim(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setMessage('');
    setLoading(true);

    try {
      const history = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.text,
      }));

      const response = await sendChatMessage(
        activeMode,
        userMsg.text,
        history,
        userRules || undefined,
        userName || undefined
      );

      if (!response) {
        throw new Error('AI не ответил');
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: response.content,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      
      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      
      // Сохраняем историю
      await saveChatHistory(finalMessages);

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    } catch (error) {
      logger.error('Error sending chat message', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось получить ответ',
        variant: 'destructive',
      });
      // Удаляем сообщение пользователя при ошибке
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bot" size={24} />
              AI-чат
            </CardTitle>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Общайтесь с AI в разных режимах. История сохраняется до 50 сообщений.
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
              {modes.map((m) => {
                // Проверяем доступ к режиму бухгалтера
                if (m.id === 'accountant' && !hasPermission('ai.chat.accountant')) {
                  return null;
                }
                
                return (
                  <Button
                    key={m.id}
                    variant={activeMode === m.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveMode(m.id as typeof activeMode);
                      setMessages([]);
                      loadChatData();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Icon name={m.icon} size={16} />
                    {m.name}
                  </Button>
                );
              })}
              
              <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Настройки чата</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Настройте персонализацию для {modes.find(m => m.id === activeMode)?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-white">Ваше имя</Label>
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Как к вам обращаться?"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Дополнительные правила</Label>
                      <Textarea
                        value={userRules}
                        onChange={(e) => setUserRules(e.target.value)}
                        placeholder="Например: Отвечай кратко, используй профессиональный тон..."
                        className="bg-gray-900 border-gray-700 min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                        Отмена
                      </Button>
                      <Button onClick={async () => {
                        if (!user?.id) return;
                        try {
                          await saveUserChatPreferences(user.id, activeMode, {
                            userRules,
                            userName,
                          });
                          toast({
                            title: 'Успешно',
                            description: 'Настройки сохранены',
                          });
                          setShowSettingsDialog(false);
                        } catch (error) {
                          toast({
                            title: 'Ошибка',
                            description: 'Не удалось сохранить настройки',
                            variant: 'destructive',
                          });
                        }
                      }}>
                        Сохранить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {quickActions.map((qa) => (
                <Button
                  key={qa.id}
                  variant="secondary"
                  className="justify-start"
                  onClick={() => setMessage(qa.prompt)}
                >
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  {qa.title}
                </Button>
              ))}
            </div>

            <div className="border rounded-lg h-[500px] flex flex-col">
              <div className="p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {modes.find(m => m.id === activeMode)?.name}
                  </Badge>
                  {userName && (
                    <Badge variant="outline">
                      <Icon name="User" size={12} className="mr-1" />
                      {userName}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    История: {messages.length}/50 сообщений
                  </span>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xl p-3 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-8' 
                            : 'bg-muted mr-8'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs opacity-70">{msg.time}</span>
                          {msg.role === 'assistant' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              AI
                            </Badge>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center py-12 space-y-3">
                      <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground opacity-50" />
                      <div className="space-y-1">
                        <div className="text-lg font-medium">Начните диалог</div>
                        <div className="text-sm text-muted-foreground max-w-md mx-auto">
                          {modes.find(m => m.id === activeMode)?.description}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Введите сообщение для ${modes.find(m => m.id === activeMode)?.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                    disabled={loading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !message.trim()}
                    className="self-end h-[60px] px-6"
                  >
                    {loading ? (
                      <>
                        <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                        Ожидайте
                      </>
                    ) : (
                      <>
                        <Icon name="Send" className="mr-2" size={16} />
                        Отправить
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIChat;
