// Хук для работы с AI чатом

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendChatMessage } from '@/services/aiService';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

interface UseAIChatProps {
  chatType: 'universal' | 'site' | 'ads' | 'accountant';
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: string) => void;
}

export const useAIChat = (props: UseAIChatProps) => {
  const { chatType, onMessageSent, onResponseReceived } = props;
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [userRules, setUserRules] = useState('');
  const [userName, setUserName] = useState('');

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || loading || !user?.id) {
      return;
    }

    try {
      setLoading(true);
      
      // Добавляем сообщение пользователя
      const userMessage = { role: 'user' as const, content: message };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      if (onMessageSent) {
        onMessageSent(message);
      }

      // Отправляем запрос к AI
      const response = await sendChatMessage(
        chatType,
        message,
        updatedMessages,
        userRules || undefined,
        userName || undefined
      );

      if (!response) {
        throw new Error('AI не ответил');
      }

      // Добавляем ответ AI
      const aiMessage = { role: 'assistant' as const, content: response.content };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      if (onResponseReceived) {
        onResponseReceived(response.content);
      }

    } catch (error) {
      logger.error('Error sending AI message', error instanceof Error ? error : new Error(String(error)));
      
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось получить ответ',
        variant: 'destructive',
      });
      
      // Откатываем сообщение при ошибке
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }, [chatType, loading, user?.id, messages, userRules, userName, onMessageSent, onResponseReceived, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updatePreferences = useCallback((preferences: { userRules?: string; userName?: string }) => {
    if (preferences.userRules !== undefined) {
      setUserRules(preferences.userRules);
    }
    if (preferences.userName !== undefined) {
      setUserName(preferences.userName);
    }
  }, []);

  return {
    messages,
    loading,
    userRules,
    userName,
    setUserRules,
    setUserName,
    sendMessage,
    clearMessages,
    updatePreferences,
  };
};

