
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
    
    // A combinação de canais separados por evento oferece mais estabilidade
    const insertChannel = supabase
      .channel(`comments-insert-${solutionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, () => {
        log('Novo comentário detectado', { solutionId, moduleId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'INSERT');
      });
      
    const updateChannel = supabase
      .channel(`comments-update-${solutionId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, () => {
        log('Comentário atualizado', { solutionId, moduleId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'UPDATE');
      });
      
    const deleteChannel = supabase
      .channel(`comments-delete-${solutionId}`)
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, () => {
        log('Comentário removido', { solutionId, moduleId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'DELETE');
      });
      
    // Inscrever-se em mudanças na tabela de curtidas
    const likesChannel = supabase
      .channel(`comment-likes-${solutionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tool_comment_likes'
      }, () => {
        log('Curtida modificada, invalidando queries', { solutionId, moduleId });
        invalidateComments();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'LIKES');
      });
    
    const invalidateComments = () => {
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });
    };
    
    const handleSubscriptionStatus = (status: string, channelType: string) => {
      if (status === 'SUBSCRIBED') {
        log(`Canal de ${channelType} conectado com sucesso`, { solutionId, moduleId });
      } else if (status === 'CHANNEL_ERROR') {
        // Previne múltiplas notificações de erro
        logError(`Erro no canal de ${channelType}`, { status, solutionId, moduleId });
        
        // Mostra apenas um toast para evitar spam de erros
        if (channelType === 'INSERT') {
          toast.error("Atualizações em tempo real indisponíveis", {
            description: "Os comentários precisarão ser atualizados manualmente.",
            duration: 5000,
            id: "realtime-error" // Previne múltiplos toasts do mesmo tipo
          });
        }
      }
    };
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários', { solutionId, moduleId });
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
      supabase.removeChannel(deleteChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
