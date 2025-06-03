
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';

interface RealtimeConfig {
  isEnabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debounceMs?: number;
}

export const useRealtimeLessonComments = (
  lessonId: string, 
  config: RealtimeConfig = {}
) => {
  const {
    isEnabled = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    debounceMs = 500
  } = config;
  
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();
  
  const channelsRef = useRef<any[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  const isConnectedRef = useRef(false);
  
  const queryKey = ['learning-comments', lessonId];

  // Invalidação com debounce
  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const now = Date.now();
      
      // Evitar invalidações muito frequentes
      if (now - lastUpdateRef.current < debounceMs) {
        return;
      }
      
      lastUpdateRef.current = now;
      
      queryClient.invalidateQueries({ queryKey });
      log('Cache de comentários invalidado (debounced)', { lessonId });
    }, debounceMs);
  }, [queryClient, queryKey, lessonId, log, debounceMs]);

  // Configurar conexões realtime resilientes
  const setupRealtimeConnections = useCallback(() => {
    if (!isEnabled || !lessonId) return;
    
    // Limpar conexões existentes
    channelsRef.current.forEach(channel => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    });
    channelsRef.current = [];
    
    log('Configurando conexões realtime resilientes', { lessonId });
    
    // Canal para comentários
    const commentsChannel = supabase
      .channel(`lesson-comments-${lessonId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_comments',
        filter: `lesson_id=eq.${lessonId}`
      }, (payload) => {
        log('Mudança nos comentários detectada', { 
          event: payload.eventType, 
          lessonId,
          commentId: payload.new?.id || payload.old?.id
        });
        debouncedInvalidate();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'comments');
      });
    
    // Canal para curtidas
    const likesChannel = supabase
      .channel(`lesson-comment-likes-${lessonId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_comment_likes'
      }, (payload) => {
        log('Mudança nas curtidas detectada', { 
          event: payload.eventType,
          lessonId 
        });
        debouncedInvalidate();
      })
      .subscribe((status) => {
        handleSubscriptionStatus(status, 'likes');
      });
    
    channelsRef.current = [commentsChannel, likesChannel];
  }, [isEnabled, lessonId, log, debouncedInvalidate]);

  // Gerenciar status das conexões
  const handleSubscriptionStatus = useCallback((status: string, channelType: string) => {
    switch (status) {
      case 'SUBSCRIBED':
        log(`Canal ${channelType} conectado com sucesso`, { lessonId });
        reconnectAttemptsRef.current = 0;
        isConnectedRef.current = true;
        break;
        
      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
      case 'CLOSED':
        logError(`Erro no canal ${channelType}: ${status}`, { 
          lessonId, 
          status,
          showToast: false // Não mostrar toast para erros de realtime
        });
        isConnectedRef.current = false;
        
        // Tentar reconectar com backoff exponencial
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000 // Max 30 segundos
          );
          
          log(`Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`, { 
            lessonId, 
            channelType 
          });
          
          setTimeout(() => {
            setupRealtimeConnections();
          }, delay);
        } else {
          log(`Máximo de tentativas de reconexão atingido para ${channelType}`, { lessonId });
          
          // Implementar fallback: polling periódico
          const fallbackInterval = setInterval(() => {
            if (!isConnectedRef.current) {
              log('Fallback: invalidando cache por polling', { lessonId });
              debouncedInvalidate();
            } else {
              clearInterval(fallbackInterval);
            }
          }, 30000); // A cada 30 segundos
          
          // Parar fallback após 10 minutos
          setTimeout(() => {
            clearInterval(fallbackInterval);
          }, 600000);
        }
        break;
    }
  }, [lessonId, log, logError, maxReconnectAttempts, reconnectInterval, setupRealtimeConnections, debouncedInvalidate]);

  // Health check das conexões
  const performHealthCheck = useCallback(() => {
    const activeChannels = channelsRef.current.filter(channel => 
      channel && channel.state === 'joined'
    );
    
    const isHealthy = activeChannels.length > 0;
    
    log('Health check realtime', { 
      lessonId,
      totalChannels: channelsRef.current.length,
      activeChannels: activeChannels.length,
      isHealthy,
      reconnectAttempts: reconnectAttemptsRef.current
    });
    
    if (!isHealthy && reconnectAttemptsRef.current === 0) {
      log('Conexão não saudável, tentando reconectar', { lessonId });
      setupRealtimeConnections();
    }
    
    return isHealthy;
  }, [lessonId, log, setupRealtimeConnections]);

  // Configurar conexões ao montar e limpar ao desmontar
  useEffect(() => {
    if (isEnabled && lessonId) {
      setupRealtimeConnections();
      
      // Health check periódico
      const healthCheckInterval = setInterval(performHealthCheck, 60000); // A cada minuto
      
      return () => {
        clearInterval(healthCheckInterval);
        
        // Limpar debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        // Limpar canais
        channelsRef.current.forEach(channel => {
          if (channel) {
            supabase.removeChannel(channel);
          }
        });
        channelsRef.current = [];
        
        log('Conexões realtime limpas', { lessonId });
      };
    }
  }, [isEnabled, lessonId, setupRealtimeConnections, performHealthCheck, log]);

  return {
    isConnected: isConnectedRef.current,
    reconnectAttempts: reconnectAttemptsRef.current,
    performHealthCheck,
    forceReconnect: setupRealtimeConnections
  };
};
