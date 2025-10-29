
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

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
    
    // Criamos um único canal com múltiplos filtros para melhor performance
    const channel = supabase
      .channel(`comments-${solutionId}-${moduleId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'solution_comments',
        filter: `solution_id=eq.${solutionId}`
      }, (payload) => {
        log('Novo comentário detectado', { payload });
        invalidateComments();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'solution_comments',
        filter: `solution_id=eq.${solutionId}`
      }, (payload) => {
        log('Comentário atualizado', { payload });
        invalidateComments();
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'solution_comments',
        filter: `solution_id=eq.${solutionId}`
      }, (payload) => {
        log('Comentário removido', { payload });
        invalidateComments();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'solution_comment_likes'
      }, () => {
        log('Curtida modificada, invalidando queries', { solutionId, moduleId });
        invalidateComments();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log('Canal de realtime conectado com sucesso', { solutionId, moduleId });
        } else if (status === 'CHANNEL_ERROR') {
          logError('Erro ao conectar canal de realtime', { status, solutionId, moduleId });
          
          toast.error("Atualizações em tempo real indisponíveis", {
            description: "Os comentários precisarão ser atualizados manualmente.",
            duration: 5000,
            id: "realtime-error" // Previne múltiplos toasts do mesmo tipo
          });
        }
      });
    
    const invalidateComments = () => {
      // Invalidar tanto a chave antiga quanto a nova para garantir compatibilidade
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });
      
      // Invalidar também a chave usada em useCommentsData
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, 'all'] 
      });
      
      // E a chave antiga para garantir compatibilidade
      queryClient.invalidateQueries({ 
        queryKey: ['tool-comments', solutionId] 
      });
    };
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários', { solutionId, moduleId });
      supabase.removeChannel(channel);
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
