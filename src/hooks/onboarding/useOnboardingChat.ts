
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useOnboardingChat = (stepId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendMessage = async (content: string, userInfo?: any) => {
    try {
      setIsLoading(true);
      
      // Adiciona mensagem do usuário
      const newMessage: ChatMessage = { role: 'user', content };
      setMessages(prev => [...prev, newMessage]);

      // Salva mensagem no Supabase
      await supabase.from('onboarding_chat_messages').insert({
        user_id: user?.id,
        message: content,
        step_id: stepId,
        is_ai: false
      });

      // Chama a função edge do Supabase
      const { data, error } = await supabase.functions.invoke('chat-onboarding', {
        body: { 
          messages: [...messages, newMessage],
          userInfo
        }
      });

      if (error) throw error;

      if (data.reply) {
        const aiMessage: ChatMessage = { role: 'assistant', content: data.reply };
        setMessages(prev => [...prev, aiMessage]);

        // Salva resposta da IA no Supabase
        await supabase.from('onboarding_chat_messages').insert({
          user_id: user?.id,
          message: data.reply,
          step_id: stepId,
          is_ai: true
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
};
