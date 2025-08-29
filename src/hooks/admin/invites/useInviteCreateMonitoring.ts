import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para monitoramento e alertas do sistema de convites
 */
export const useInviteCreateMonitoring = () => {

  const logInviteCreationMetrics = useCallback((data: {
    email: string;
    channelPreference: string;
    creationTime: number;
    success: boolean;
    error?: string;
    phases?: {
      dbTime?: number;
      emailTime?: number;
      whatsappTime?: number;
      parallelTime?: number;
    };
  }) => {
    const logData = {
      event: 'invite_creation_performance',
      timestamp: new Date().toISOString(),
      ...data
    };

    // Log estruturado DETALHADO para monitoramento
    console.log('📊 [INVITE-METRICS-DETAILED]', JSON.stringify(logData));

    // Análise de gargalos específicos
    if (data.phases) {
      if (data.phases.dbTime && data.phases.dbTime > 2000) {
        console.warn('🐌 [GARGALO] Banco de dados lento:', `${data.phases.dbTime}ms`);
      }
      if (data.phases.emailTime && data.phases.emailTime > 5000) {
        console.warn('🐌 [GARGALO] Email lento:', `${data.phases.emailTime}ms`);
      }
      if (data.phases.whatsappTime && data.phases.whatsappTime > 8000) {
        console.warn('🐌 [GARGALO] WhatsApp lento:', `${data.phases.whatsappTime}ms`);
      }
    }

    // Alertas para performance ESCALONADOS
    if (data.creationTime > 5000 && data.creationTime <= 10000) {
      console.warn('⚠️ [PERFORMANCE] Sistema levemente lento:', `${Math.round(data.creationTime / 1000)}s`);
    }
    
    if (data.creationTime > 10000 && data.creationTime <= 20000) {
      toast.warning('⚠️ Sistema lento detectado', {
        description: `Criação de convite demorou ${Math.round(data.creationTime / 1000)}s`
      });
    }

    if (data.creationTime > 20000) {
      toast.error('🚨 Sistema com problema crítico', {
        description: 'Criação de convite extremamente lenta. Equipe será notificada.'
      });
    }
  }, []);

  const logEdgeFunctionPerformance = useCallback((data: {
    functionName: string;
    duration: number;
    success: boolean;
    error?: string;
    attempts?: number;
    statusCode?: number;
  }) => {
    const logData = {
      event: 'edge_function_performance',
      timestamp: new Date().toISOString(),
      ...data
    };

    console.log('🔍 [EDGE-FUNCTION-METRICS-DETAILED]', JSON.stringify(logData));

    // Alertas específicos para Edge Functions
    if (data.functionName === 'send-whatsapp-invite') {
      if (data.duration > 10000) {
        console.warn(`📱 [WHATSAPP-SLOW] Função WhatsApp lenta: ${data.duration}ms`);
      }
      if (data.attempts && data.attempts > 1) {
        console.warn(`🔄 [WHATSAPP-RETRY] WhatsApp precisou de retry: ${data.attempts} tentativas`);
      }
    }

    if (data.functionName === 'send-invite-email') {
      if (data.duration > 8000) {
        console.warn(`📧 [EMAIL-SLOW] Função Email lenta: ${data.duration}ms`);
      }
    }

    // Alert geral para funções muito lentas
    if (data.duration > 15000) {
      toast.warning(`⚠️ ${data.functionName} muito lenta`, {
        description: `${Math.round(data.duration / 1000)}s - verifique conectividade`
      });
    }
  }, []);

  const logChannelSpecificEvent = useCallback((data: {
    channel: 'email' | 'whatsapp';
    event: 'start' | 'success' | 'error' | 'timeout' | 'retry';
    duration?: number;
    error?: string;
    metadata?: Record<string, any>;
  }) => {
    const logData = {
      event: 'channel_specific_performance',
      timestamp: new Date().toISOString(),
      ...data
    };

    const channelEmoji = data.channel === 'email' ? '📧' : '📱';
    const eventSymbol = data.event === 'success' ? '✅' : 
                       data.event === 'error' ? '❌' : 
                       data.event === 'timeout' ? '⏰' :
                       data.event === 'retry' ? '🔄' : '🚀';

    console.log(`${channelEmoji}${eventSymbol} [CHANNEL-${data.channel.toUpperCase()}-${data.event.toUpperCase()}]`, JSON.stringify(logData));
  }, []);

  return {
    logInviteCreationMetrics,
    logEdgeFunctionPerformance,
    logChannelSpecificEvent
  };
};