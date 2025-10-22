import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastHeartbeat: Date | null;
  reconnectAttempts: number;
}

interface UseRealtimeConnectionOptions {
  channelName: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  heartbeatInterval?: number;
}

export function useRealtimeConnection(options: UseRealtimeConnectionOptions) {
  const {
    channelName,
    onConnect,
    onDisconnect,
    onError,
    heartbeatInterval = 30000, // 30 segundos
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false,
    lastHeartbeat: null,
    reconnectAttempts: 0,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para enviar heartbeat
  const sendHeartbeat = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: { timestamp: new Date().toISOString() },
      });

      setStatus((prev) => ({
        ...prev,
        lastHeartbeat: new Date(),
      }));

      console.log('🫀 [REALTIME] Heartbeat enviado:', channelName);
    }
  }, [channelName]);

  // Função para iniciar heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    console.log('💓 [REALTIME] Heartbeat iniciado:', channelName);
  }, [sendHeartbeat, heartbeatInterval, channelName]);

  // Função para parar heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
      console.log('💔 [REALTIME] Heartbeat parado:', channelName);
    }
  }, [channelName]);

  // Função para conectar ao canal
  const connect = useCallback(async () => {
    try {
      console.log('🔌 [REALTIME] Conectando ao canal:', channelName);

      // Criar canal
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: channelName },
        },
      });

      // Configurar handlers
      channel
        .on('system', {}, (payload) => {
          console.log('📡 [REALTIME] System event:', payload);
          
          if (payload.extension === 'postgres_changes') {
            if (payload.status === 'ok') {
              console.log('✅ [REALTIME] Postgres changes habilitado');
            }
          }
        })
        .subscribe(async (status) => {
          console.log('📊 [REALTIME] Status mudou:', status);

          if (status === 'SUBSCRIBED') {
            setStatus((prev) => ({
              ...prev,
              isConnected: true,
              isReconnecting: false,
              reconnectAttempts: 0,
            }));

            startHeartbeat();
            onConnect?.();
            console.log('✅ [REALTIME] Conectado com sucesso:', channelName);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('❌ [REALTIME] Erro de conexão:', status);
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
            }));
            
            stopHeartbeat();
            onDisconnect?.();
            
            // Tentar reconectar
            scheduleReconnect();
          } else if (status === 'CLOSED') {
            console.warn('⚠️ [REALTIME] Canal fechado');
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
            }));
            
            stopHeartbeat();
            onDisconnect?.();
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('❌ [REALTIME] Erro ao conectar:', error);
      onError?.(error as Error);
      scheduleReconnect();
    }
  }, [channelName, onConnect, onDisconnect, onError, startHeartbeat, stopHeartbeat]);

  // Função para agendar reconexão
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      return; // Já existe um timer de reconexão
    }

    setStatus((prev) => {
      const newAttempts = prev.reconnectAttempts + 1;
      const delay = Math.min(1000 * Math.pow(2, newAttempts), 30000); // Backoff exponencial, máx 30s

      console.log(`🔄 [REALTIME] Reconectando em ${delay}ms (tentativa ${newAttempts})`);

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);

      return {
        ...prev,
        isReconnecting: true,
        reconnectAttempts: newAttempts,
      };
    });
  }, [connect]);

  // Função para desconectar
  const disconnect = useCallback(async () => {
    console.log('🔌 [REALTIME] Desconectando:', channelName);

    stopHeartbeat();

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setStatus({
      isConnected: false,
      isReconnecting: false,
      lastHeartbeat: null,
      reconnectAttempts: 0,
    });
  }, [channelName, stopHeartbeat]);

  // Conectar automaticamente ao montar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    channel: channelRef.current,
    status,
    connect,
    disconnect,
    sendHeartbeat,
  };
}
