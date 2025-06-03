
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

export const useRealtimeLessonComments = (lessonId: string, isEnabled = true) => {
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();
  
  useEffect(() => {
    if (!isEnabled || !lessonId) {
      return;
    }
    
    let retryCount = 0;
    let retryTimeoutId: NodeJS.Timeout | null = null;
    let insertChannel: any = null;
    let updateChannel: any = null;
    let deleteChannel: any = null;
    let likesChannel: any = null;
    
    const setupConnections = () => {
      log('Iniciando escuta de comentários em tempo real para aula', { 
        lessonId, 
        attempt: retryCount + 1 
      });
      
      // Canal para inserções
      insertChannel = supabase
        .channel(`lesson-comments-insert-${lessonId}-${Date.now()}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'learning_comments',
          filter: `lesson_id=eq.${lessonId}`
        }, (payload) => {
          log('Novo comentário de aula detectado', { lessonId, payload });
          invalidateComments();
          retryCount = 0; // Reset em caso de sucesso
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'INSERT');
        });
        
      // Canal para atualizações
      updateChannel = supabase
        .channel(`lesson-comments-update-${lessonId}-${Date.now()}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'learning_comments',
          filter: `lesson_id=eq.${lessonId}`
        }, (payload) => {
          log('Comentário de aula atualizado', { lessonId, payload });
          invalidateComments();
          retryCount = 0;
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'UPDATE');
        });
        
      // Canal para exclusões
      deleteChannel = supabase
        .channel(`lesson-comments-delete-${lessonId}-${Date.now()}`)
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'learning_comments',
          filter: `lesson_id=eq.${lessonId}`
        }, (payload) => {
          log('Comentário de aula removido', { lessonId, payload });
          invalidateComments();
          retryCount = 0;
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'DELETE');
        });
        
      // Canal para curtidas
      likesChannel = supabase
        .channel(`lesson-comment-likes-${lessonId}-${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'learning_comment_likes'
        }, (payload) => {
          log('Curtida de comentário modificada, atualizando', { lessonId, payload });
          invalidateComments();
          retryCount = 0;
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'LIKES');
        });
    };
    
    const handleSubscriptionStatus = (status: string, channelType: string) => {
      if (status === 'SUBSCRIBED') {
        log(`Canal de ${channelType} conectado com sucesso`, { 
          lessonId, 
          attempt: retryCount + 1 
        });
        
        if (retryCount > 0) {
          toast.success("Comentários reconectados", {
            id: "lesson-realtime-reconnected"
          });
        }
      } else if (status === 'CHANNEL_ERROR') {
        logError(`Erro no canal de ${channelType}`, { status, lessonId, attempt: retryCount + 1 });
        
        if (channelType === 'INSERT') {
          handleConnectionError();
        }
      }
    };
    
    const handleConnectionError = () => {
      if (retryCount >= DEFAULT_RETRY_CONFIG.maxRetries) {
        logError('Máximo de tentativas de reconexão atingido para comentários de aula', { 
          lessonId, 
          maxRetries: DEFAULT_RETRY_CONFIG.maxRetries 
        });
        
        implementFallbackRefresh();
        return;
      }
      
      retryCount++;
      const delay = calculateRetryDelay(retryCount);
      
      log(`Tentando reconectar comentários de aula em ${delay}ms`, { 
        lessonId, 
        attempt: retryCount 
      });
      
      toast.info(`Reconectando comentários... (${retryCount}/${DEFAULT_RETRY_CONFIG.maxRetries})`, {
        id: "lesson-realtime-reconnecting",
        duration: delay
      });
      
      // Limpar canais anteriores
      cleanupChannels();
      
      retryTimeoutId = setTimeout(() => {
        setupConnections();
      }, delay);
    };
    
    const calculateRetryDelay = (attempt: number): number => {
      const baseDelay = DEFAULT_RETRY_CONFIG.baseDelay;
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 * exponentialDelay;
      
      return Math.min(
        exponentialDelay + jitter,
        DEFAULT_RETRY_CONFIG.maxDelay
      );
    };
    
    const implementFallbackRefresh = () => {
      toast.error("Atualizações de comentários limitadas", {
        description: "Os comentários serão atualizados automaticamente a cada 30 segundos.",
        duration: 8000,
        id: "lesson-realtime-fallback"
      });
      
      const fallbackInterval = setInterval(() => {
        log('Fallback: atualizando comentários de aula automaticamente', { lessonId });
        invalidateComments();
      }, 30000);
      
      setTimeout(() => {
        clearInterval(fallbackInterval);
      }, 600000);
    };
    
    const invalidateComments = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['learning-comments', lessonId] 
      });
    };
    
    const cleanupChannels = () => {
      if (insertChannel) supabase.removeChannel(insertChannel);
      if (updateChannel) supabase.removeChannel(updateChannel);
      if (deleteChannel) supabase.removeChannel(deleteChannel);
      if (likesChannel) supabase.removeChannel(likesChannel);
    };
    
    // Iniciar conexões
    setupConnections();
    
    // Cleanup ao desmontar
    return () => {
      log('Cancelando escuta de comentários da aula', { lessonId });
      
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      
      cleanupChannels();
      
      toast.dismiss("lesson-realtime-reconnecting");
      toast.dismiss("lesson-realtime-fallback");
    };
  }, [lessonId, queryClient, isEnabled, log, logError]);
};
