
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';

export const useRealtimeLessonComments = (lessonId: string, isEnabled = true) => {
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();
  
  useEffect(() => {
    if (!isEnabled || !lessonId) {
      return;
    }
    
    log('Iniciando escuta de comentários em tempo real para aula', { lessonId });
    
    let connectionRetries = 0;
    const maxRetries = 3;
    const retryDelay = 2000;
    
    const setupRealtimeConnection = () => {
      // Canal para inserções
      const insertChannel = supabase
        .channel(`lesson-comments-insert-${lessonId}-${Date.now()}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'learning_comments',
          filter: `lesson_id=eq.${lessonId}`
        }, (payload) => {
          log('Novo comentário de aula detectado', { lessonId, payload });
          invalidateComments();
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'INSERT');
        });
        
      // Canal para atualizações
      const updateChannel = supabase
        .channel(`lesson-comments-update-${lessonId}-${Date.now()}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'learning_comments',
          filter: `lesson_id=eq.${lessonId}`
        }, (payload) => {
          log('Comentário de aula atualizado', { lessonId, payload });
          invalidateComments();
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'UPDATE');
        });
        
      // Canal para exclusões
      const deleteChannel = supabase
        .channel(`lesson-comments-delete-${lessonId}-${Date.now()}`)
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'learning_comments',
          filter: `lesson_id=eq.${lessonId}`
        }, (payload) => {
          log('Comentário de aula removido', { lessonId, payload });
          invalidateComments();
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'DELETE');
        });
        
      // Canal para curtidas
      const likesChannel = supabase
        .channel(`lesson-comment-likes-${lessonId}-${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'learning_comment_likes'
        }, (payload) => {
          log('Curtida de comentário modificada, atualizando', { lessonId, payload });
          invalidateComments();
        })
        .subscribe((status) => {
          handleSubscriptionStatus(status, 'LIKES');
        });
      
      return { insertChannel, updateChannel, deleteChannel, likesChannel };
    };
    
    const invalidateComments = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['learning-comments', lessonId] 
      });
    };
    
    const handleSubscriptionStatus = (status: string, channelType: string) => {
      if (status === 'SUBSCRIBED') {
        log(`Canal de ${channelType} conectado com sucesso`, { lessonId });
        connectionRetries = 0; // Reset retry counter on success
      } else if (status === 'CHANNEL_ERROR') {
        logError(`Erro no canal de ${channelType}`, { 
          status, 
          lessonId,
          showToast: false // Não mostrar toast para erros de realtime
        });
        
        // Implementar retry com backoff exponencial
        if (connectionRetries < maxRetries) {
          connectionRetries++;
          const delay = retryDelay * Math.pow(2, connectionRetries - 1);
          
          log(`Tentando reconectar canal ${channelType} em ${delay}ms (tentativa ${connectionRetries}/${maxRetries})`, { lessonId });
          
          setTimeout(() => {
            setupRealtimeConnection();
          }, delay);
        } else {
          log(`Máximo de tentativas de reconexão atingido para ${channelType}`, { lessonId });
          // Implementar fallback: refresh automático a cada 30 segundos
          const fallbackInterval = setInterval(() => {
            log('Fallback: atualizando comentários automaticamente', { lessonId });
            invalidateComments();
          }, 30000);
          
          // Limpar interval após 5 minutos
          setTimeout(() => {
            clearInterval(fallbackInterval);
          }, 300000);
        }
      } else if (status === 'TIMED_OUT') {
        logError(`Timeout no canal de ${channelType}`, { 
          status, 
          lessonId,
          showToast: false // Não mostrar toast para timeouts
        });
      }
    };
    
    // Configurar conexão inicial
    const channels = setupRealtimeConnection();
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários da aula', { lessonId });
      Object.values(channels).forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [lessonId, queryClient, isEnabled, log, logError]);
};
