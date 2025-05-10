
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

export const useRealtimeLessonComments = (lessonId: string, isEnabled = true) => {
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();
  
  useEffect(() => {
    if (!isEnabled || !lessonId) {
      return;
    }
    
    log('Iniciando escuta de comentários em tempo real para aula', { lessonId });
    
    // Canal para inserções
    const insertChannel = supabase
      .channel(`lesson-comments-insert-${lessonId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'learning_comments',
        filter: `lesson_id=eq.${lessonId}`
      }, () => {
        log('Novo comentário de aula detectado', { lessonId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'INSERT');
      });
      
    // Canal para atualizações
    const updateChannel = supabase
      .channel(`lesson-comments-update-${lessonId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'learning_comments',
        filter: `lesson_id=eq.${lessonId}`
      }, () => {
        log('Comentário de aula atualizado', { lessonId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'UPDATE');
      });
      
    // Canal para exclusões
    const deleteChannel = supabase
      .channel(`lesson-comments-delete-${lessonId}`)
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'learning_comments',
        filter: `lesson_id=eq.${lessonId}`
      }, () => {
        log('Comentário de aula removido', { lessonId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'DELETE');
      });
      
    // Canal para curtidas
    const likesChannel = supabase
      .channel(`lesson-comment-likes-${lessonId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_comment_likes'
      }, () => {
        log('Curtida de comentário modificada, atualizando', { lessonId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'LIKES');
      });
    
    const invalidateComments = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['learning-comments', lessonId] 
      });
    };
    
    const handleSubscriptionStatus = (status: string, channelType: string) => {
      if (status === 'SUBSCRIBED') {
        log(`Canal de ${channelType} conectado com sucesso`, { lessonId });
      } else if (status === 'CHANNEL_ERROR') {
        logError(`Erro no canal de ${channelType}`, { status, lessonId });
        
        if (channelType === 'INSERT') {
          toast.error("Atualizações em tempo real indisponíveis", {
            description: "Os comentários precisarão ser atualizados manualmente.",
            duration: 5000,
            id: "learning-realtime-error"
          });
        }
      }
    };
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários da aula', { lessonId });
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
      supabase.removeChannel(deleteChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [lessonId, queryClient, isEnabled, log, logError]);
};
