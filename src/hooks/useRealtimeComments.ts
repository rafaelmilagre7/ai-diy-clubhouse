
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
  const { log, logError } = useLogging("useRealtimeComments");
  const isSubscribedRef = useRef(false);
  const channelRef = useRef<any>(null);
  
  useEffect(() => {
    // Não configurar se já estiver inscrito ou não estiver habilitado
    if (isSubscribedRef.current || !isEnabled || !solutionId || !moduleId) {
      return;
    }
    
    // Marcar como inscrito
    isSubscribedRef.current = true;
    
    log('Iniciando escuta de comentários em tempo real', { solutionId, moduleId });
    
    // Limpar canal anterior para evitar múltiplas inscrições
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Usando um único canal para múltiplos eventos
    const channel = supabase
      .channel(`comments-${solutionId}-${moduleId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, handleChange)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, handleChange)
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, handleChange)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tool_comment_likes'
      }, handleChange)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log('Canal de comentários conectado com sucesso', { solutionId, moduleId });
        } else if (status === 'CHANNEL_ERROR') {
          logError('Erro no canal de comentários', { status, solutionId, moduleId });
          toast.error("Atualizações em tempo real indisponíveis", {
            description: "Os comentários precisarão ser atualizados manualmente.",
            duration: 5000,
            id: "realtime-error-comments" // Previne múltiplos toasts do mesmo tipo
          });
        }
      });
    
    // Guardar referência para limpeza posterior
    channelRef.current = channel;
    
    function handleChange() {
      log('Mudança detectada nos comentários, invalidando queries', { solutionId, moduleId });
      // Invalidar queries relacionadas a comentários
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId],
        refetchType: 'active' // Apenas refetch queries ativas
      });
    }
    
    // Cancelar inscrição ao desmontar
    return () => {
      if (channelRef.current) {
        log('Cancelando escuta de comentários', { solutionId, moduleId });
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
