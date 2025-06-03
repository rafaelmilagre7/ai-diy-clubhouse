import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

interface RealtimeOptions {
  isEnabled?: boolean;
  debounceMs?: number;
  maxReconnectAttempts?: number;
}

export const useRealtimeLessonComments = (
  lessonId: string,
  options: RealtimeOptions = {}
) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  
  const {
    isEnabled = true,
    debounceMs = 500,
    maxReconnectAttempts = 3
  } = options;
  
  const channelRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const queryKey = ['learning-comments', lessonId];

  // Invalidar comentários com debounce
  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey });
      log('Comentários invalidados via realtime', { lessonId });
    }, debounceMs);
  }, [queryClient, queryKey, debounceMs, lessonId, log]);

  // Verificação de saúde da conexão
  const performHealthCheck = useCallback(() => {
    if (!channelRef.current) return false;
    
    const state = channelRef.current.state;
    const isHealthy = state === 'joined' || state === 'joining';
    
    log('Health check realtime', { 
      lessonId, 
      state, 
      isHealthy,
      reconnectAttempts: reconnectAttemptsRef.current 
    });
    
    return isHealthy;
  }, [lessonId, log]);

  // Configurar conexão realtime
  const setupRealtimeConnection = useCallback(() => {
    if (!isEnabled || !lessonId) return;
    
    // Limpar conexão anterior
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    log('Configurando conexão realtime para comentários', { lessonId });
    
    const channel = supabase
      .channel(`lesson-comments-${lessonId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_comments',
        filter: `lesson_id=eq.${lessonId}`
      }, (payload) => {
        // Type guard para verificar se payload.new e payload.old têm a propriedade id
        const hasNewId = payload.new && typeof payload.new === 'object' && 'id' in payload.new;
        const hasOldId = payload.old && typeof payload.old === 'object' && 'id' in payload.old;
        
        const recordId = hasNewId 
          ? (payload.new as any).id 
          : hasOldId 
            ? (payload.old as any).id 
            : 'unknown';
            
        log('Mudança detectada nos comentários', { 
          event: payload.eventType, 
          lessonId,
          recordId
        });
        
        debouncedInvalidate();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_comment_likes'
      }, (payload) => {
        log('Curtida modificada em comentário', { lessonId });
        debouncedInvalidate();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnectedRef.current = true;
          reconnectAttemptsRef.current = 0;
          log('Canal realtime conectado', { lessonId });
        } else if (status === 'CHANNEL_ERROR') {
          isConnectedRef.current = false;
          logError('Erro no canal realtime', { status, lessonId });
          
          // Tentar reconectar
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
            
            setTimeout(() => {
              log('Tentando reconectar canal realtime', { 
                lessonId, 
                attempt: reconnectAttemptsRef.current 
              });
              setupRealtimeConnection();
            }, delay);
          } else {
            toast.error('Conexão instável detectada', {
              description: 'Comentários serão atualizados quando você recarregar a página.',
              duration: 5000
            });
          }
        }
      });
    
    channelRef.current = channel;
  }, [isEnabled, lessonId, debouncedInvalidate, maxReconnectAttempts, log, logError]);

  // Efeito para montar e desmontar a conexão realtime
  useEffect(() => {
    setupRealtimeConnection();
    
    return () => {
      log('Desmontando conexão realtime', { lessonId });
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setupRealtimeConnection, lessonId, log]);

  return {
    isConnected: isConnectedRef.current,
    performHealthCheck
  };
};
