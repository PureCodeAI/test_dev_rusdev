import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { retryFetch } from '@/utils/retryFetch';
import type { AIMessage } from '@/types/academy';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

// Санитизация HTML для защиты от XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

interface AIConsultantProps {
  courseId?: string;
  lessonId?: string;
}

const AIConsultant = ({ courseId, lessonId }: AIConsultantProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Приветственное сообщение
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      sender: 'ai',
      text: 'Привет! Я ваш AI-консультант по обучению. Задайте мне любой вопрос о курсе, и я помогу вам разобраться.',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (!user?.id) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы отправлять сообщения консультанту.',
        variant: 'destructive',
      });
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    const messageText = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (!API_ENDPOINTS.blocks) {
        throw new Error('API endpoint not configured');
      }

      const apiUrl = `${API_ENDPOINTS.blocks}?type=academy&action=ai_consultant`;
      
      const response = await retryFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id),
        },
        body: JSON.stringify({
          message: messageText,
          course_id: courseId || null,
          lesson_id: lessonId || null,
          user_id: user.id,
        }),
        signal: abortControllerRef.current.signal,
      }, {
        maxRetries: 2,
        retryDelay: 500,
        retryCondition: (error) => {
          return error.name !== 'AbortError' && 
                 (error.message.includes('network') || error.message.includes('fetch'));
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiText = typeof data?.response === 'string' && data.response.trim()
        ? data.response
        : typeof data?.message === 'string' && data.message.trim()
          ? data.message
          : 'Не удалось получить ответ от AI-консультанта';
      
      // Отслеживаем использование AI токенов
      try {
        const aiTracker = await import('@/utils/aiUsageTracker');
        const tokensUsed = data?.tokens_used || aiTracker.estimateTokens(aiText);
        await aiTracker.trackAIUsage('gpt4', tokensUsed, 'academy');
      } catch (error) {
        logger.warn('AI usage tracking failed', { error: error instanceof Error ? error.message : String(error) });
      }
      
      const aiResponse: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ответ от AI-консультанта',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, loading, courseId, lessonId, toast, user?.id]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        handleSend();
        debounceTimerRef.current = null;
      }, 300);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'user' ? 'bg-primary text-white' : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-line break-words">{escapeHtml(msg.text)}</p>
                <p className="text-xs mt-1 opacity-70">{msg.time}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Задайте вопрос..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;

