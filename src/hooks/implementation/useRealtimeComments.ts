
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';

export const useRealtimeComments = (solutionId: string, moduleId: string) => {
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();

  useEffect(() => {
    // Configura o canal Supabase para escutar mudanças nas tabelas
    const channel = supabase
      .channel('solution-comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'solution_comments',
          filter: `solution_id=eq.${solutionId}`
        },
        (payload) => {
          log('Alteração em tempo real nos comentários', { 
            event: payload.eventType, 
            solutionId, 
            payload 
          });
          
          // Invalida a consulta para recarregar os comentários
          queryClient.invalidateQueries({ 
            queryKey: ['solution-comments', solutionId, moduleId] 
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solution_comment_likes'
        },
        () => {
          // Ao alterar curtidas, recarrega os comentários
          queryClient.invalidateQueries({ 
            queryKey: ['solution-comments', solutionId, moduleId] 
          });
        }
      )
      .subscribe((status) => {
        log('Status da conexão realtime de comentários', { status, solutionId });
      });

    // Limpeza do canal quando o componente for desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [solutionId, moduleId, queryClient, log, logError]);
};
