
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';

export const useRealtimeComments = (
  solutionId: string, 
  moduleId: string,
  isEnabled = true
) => {
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();
  
  useEffect(() => {
    if (!isEnabled || !solutionId || !moduleId) {
      return;
    }
    
    log('Iniciando escuta de comentários em tempo real', { solutionId, moduleId });
    
    // Inscrever-se nas mudanças na tabela de comentários
    const commentChannel = supabase
      .channel('tool-comments-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, (payload) => {
        log('Mudança detectada em comentários', { event: payload.eventType, solutionId, moduleId });
        queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log('Escuta de comentários ativada com sucesso', { solutionId, moduleId });
        } else {
          logError('Erro ao ativar escuta de comentários', { status, solutionId, moduleId });
        }
      });
      
    // Inscrever-se em mudanças na tabela de curtidas
    const likesChannel = supabase
      .channel('tool-comment-likes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tool_comment_likes'
      }, () => {
        log('Curtida modificada, invalidando queries', { solutionId, moduleId });
        queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      })
      .subscribe();
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários', { solutionId, moduleId });
      commentChannel.unsubscribe();
      likesChannel.unsubscribe();
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
