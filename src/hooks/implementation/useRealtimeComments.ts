
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
    if (!isEnabled || !solutionId) {
      return;
    }
    
    log('Iniciando escuta de comentários em tempo real', { solutionId, moduleId });
    
    // Canal único e otimizado para todas as operações
    const channel = supabase
      .channel(`comments-realtime-${solutionId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tool_comments',
        filter: `tool_id=eq.${solutionId}`
      }, (payload) => {
        const recordId = (payload.new && typeof payload.new === 'object' && 'id' in payload.new) 
          ? (payload.new as any).id 
          : (payload.old && typeof payload.old === 'object' && 'id' in payload.old) 
            ? (payload.old as any).id 
            : 'unknown';
            
        log('Mudança detectada nos comentários', { 
          event: payload.eventType, 
          solutionId,
          recordId
        });
        
        // Invalidar todas as variações de chaves para garantir atualização
        invalidateAllCommentQueries();
        
        // Feedback visual sutil
        if (payload.eventType === 'INSERT') {
          // Não mostrar toast para comentários próprios (já tem feedback otimista)
          console.log('Novo comentário adicionado por outro usuário');
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tool_comment_likes'
      }, (payload) => {
        log('Curtida modificada, atualizando comentários', { solutionId, payload });
        invalidateAllCommentQueries();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log('Canal de realtime conectado com sucesso', { solutionId });
        } else if (status === 'CHANNEL_ERROR') {
          logError('Erro ao conectar canal de realtime', { status, solutionId });
          
          // Implementar fallback: refresh automático a cada 10 segundos
          const fallbackInterval = setInterval(() => {
            log('Fallback: atualizando comentários automaticamente', { solutionId });
            invalidateAllCommentQueries();
          }, 10000);
          
          // Limpar interval após 2 minutos
          setTimeout(() => {
            clearInterval(fallbackInterval);
          }, 120000);
          
          toast.error("Atualizações em tempo real limitadas", {
            description: "Os comentários serão atualizados automaticamente a cada 10 segundos.",
            duration: 5000,
            id: "realtime-fallback"
          });
        }
      });
    
    const invalidateAllCommentQueries = () => {
      // Invalidar com chave padronizada
      queryClient.invalidateQueries({ 
        queryKey: ['comments', solutionId] 
      });
      
      // Invalidar chaves legadas para compatibilidade
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, 'all'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tool-comments', solutionId] 
      });
      
      log('Todas as queries de comentários invalidadas', { solutionId });
    };
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários', { solutionId });
      supabase.removeChannel(channel);
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
