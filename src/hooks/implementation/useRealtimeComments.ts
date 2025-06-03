
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000  // 10 segundos máximo
};

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
    
    let retryCount = 0;
    let retryTimeoutId: NodeJS.Timeout | null = null;
    let channel: any = null;
    
    const setupConnection = () => {
      log('Iniciando escuta de comentários em tempo real', { 
        solutionId, 
        moduleId, 
        attempt: retryCount + 1 
      });
      
      // Canal único e otimizado para todas as operações
      channel = supabase
        .channel(`comments-realtime-${solutionId}-${Date.now()}`)
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
          
          // Reset contador de retry em caso de sucesso
          retryCount = 0;
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
          handleSubscriptionStatus(status);
        });
    };
    
    const handleSubscriptionStatus = (status: string) => {
      if (status === 'SUBSCRIBED') {
        log('Canal de realtime conectado com sucesso', { 
          solutionId, 
          attempt: retryCount + 1 
        });
        
        // Reset retry count em caso de sucesso
        retryCount = 0;
        
        // Mostrar feedback de reconexão se necessário
        if (retryCount > 0) {
          toast.success("Atualizações em tempo real reconectadas", {
            id: "realtime-reconnected"
          });
        }
      } else if (status === 'CHANNEL_ERROR') {
        logError('Erro ao conectar canal de realtime', { 
          status, 
          solutionId, 
          attempt: retryCount + 1 
        });
        
        handleConnectionError();
      } else if (status === 'CLOSED') {
        log('Canal de realtime fechado', { solutionId });
        
        // Tentar reconectar automaticamente se não foi intencional
        if (retryCount < DEFAULT_RETRY_CONFIG.maxRetries) {
          handleConnectionError();
        }
      }
    };
    
    const handleConnectionError = () => {
      if (retryCount >= DEFAULT_RETRY_CONFIG.maxRetries) {
        logError('Máximo de tentativas de reconexão atingido', { 
          solutionId, 
          maxRetries: DEFAULT_RETRY_CONFIG.maxRetries 
        });
        
        // Implementar fallback: refresh automático
        implementFallbackRefresh();
        return;
      }
      
      retryCount++;
      const delay = calculateRetryDelay(retryCount);
      
      log(`Tentando reconexão em ${delay}ms`, { 
        solutionId, 
        attempt: retryCount,
        maxRetries: DEFAULT_RETRY_CONFIG.maxRetries
      });
      
      // Mostrar feedback visual amigável
      toast.info(`Reconectando... (${retryCount}/${DEFAULT_RETRY_CONFIG.maxRetries})`, {
        id: "realtime-reconnecting",
        duration: delay
      });
      
      // Limpar canal anterior
      if (channel) {
        supabase.removeChannel(channel);
      }
      
      // Agendar nova tentativa
      retryTimeoutId = setTimeout(() => {
        setupConnection();
      }, delay);
    };
    
    const calculateRetryDelay = (attempt: number): number => {
      // Backoff exponencial com jitter
      const baseDelay = DEFAULT_RETRY_CONFIG.baseDelay;
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 * exponentialDelay; // 30% de jitter
      
      return Math.min(
        exponentialDelay + jitter,
        DEFAULT_RETRY_CONFIG.maxDelay
      );
    };
    
    const implementFallbackRefresh = () => {
      toast.error("Atualizações em tempo real limitadas", {
        description: "Os comentários serão atualizados automaticamente a cada 30 segundos.",
        duration: 8000,
        id: "realtime-fallback"
      });
      
      // Fallback: refresh automático a cada 30 segundos
      const fallbackInterval = setInterval(() => {
        log('Fallback: atualizando comentários automaticamente', { solutionId });
        invalidateAllCommentQueries();
      }, 30000);
      
      // Limpar fallback após 10 minutos
      setTimeout(() => {
        clearInterval(fallbackInterval);
        log('Fallback automático finalizado', { solutionId });
      }, 600000);
    };
    
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
    
    // Iniciar primeira conexão
    setupConnection();
    
    // Cancelar inscrição ao desmontar
    return () => {
      log('Cancelando escuta de comentários', { solutionId });
      
      // Limpar timeout de retry
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      
      // Remover canal
      if (channel) {
        supabase.removeChannel(channel);
      }
      
      // Limpar toast se ainda estiver visível
      toast.dismiss("realtime-reconnecting");
      toast.dismiss("realtime-fallback");
    };
  }, [solutionId, moduleId, queryClient, isEnabled, log, logError]);
};
