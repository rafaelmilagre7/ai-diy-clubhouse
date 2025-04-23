
import { useEffect, useRef } from 'react';
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
  const toastShownRef = useRef(false);
  const channelsRef = useRef<any[]>([]);
  const isSetupRef = useRef(false);
  
  useEffect(() => {
    // Não configurar se já estiver configurado ou não estiver habilitado
    if (isSetupRef.current || !isEnabled || !solutionId || !moduleId) {
      return;
    }
    
    // Marcar como configurado
    isSetupRef.current = true;
    
    log('Iniciando escuta de comentários em tempo real', { solutionId, moduleId });
    
    // Limpar canais anteriores para evitar múltiplas inscrições
    if (channelsRef.current.length > 0) {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    }
    
    // A combinação de canais separados por evento oferece mais estabilidade
    const insertChannel = supabase
      .channel(`comments-insert-${solutionId}-${moduleId}`)
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
      .channel(`comments-update-${solutionId}-${moduleId}`)
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
      .channel(`comments-delete-${solutionId}-${moduleId}`)
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
      .channel(`comment-likes-${solutionId}-${moduleId}`)
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
    
    // Guardar referências para limpeza posterior
    channelsRef.current = [insertChannel, updateChannel, deleteChannel, likesChannel];
    
    const invalidateComments = () => {
      // Usando staleTime para evitar refetches desnecessários
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId],
        refetchType: 'active' // Apenas refetch queries ativas
      });
    };
    
    const handleSubscriptionStatus = (status: string, channelType: string) => {
      if (status === 'SUBSCRIBED') {
        log(`Canal de ${channelType} conectado com sucesso`, { solutionId, moduleId });
      } else if (status === 'CHANNEL_ERROR') {
        // Previne múltiplas notificações de erro
        logError(`Erro no canal de ${channelType}`, { status, solutionId, moduleId });
        
        // Mostra apenas um toast para evitar spam de erros
        if (!toastShownRef.current) {
          toast.error("Atualizações em tempo real indisponíveis", {
            description: "Os comentários precisarão ser atualizados manualmente.",
            duration: 5000,
            id: "realtime-error" // Previne múltiplos toasts do mesmo tipo
          });
          toastShownRef.current = true;
        }
      }
    };
    
    // Cancelar inscrição ao desmontar
    return () => {
      if (channelsRef.current.length > 0) {
        log('Cancelando escuta de comentários', { solutionId, moduleId });
        channelsRef.current.forEach(channel => {
          supabase.removeChannel(channel);
        });
        channelsRef.current = [];
        isSetupRef.current = false;
      }
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
