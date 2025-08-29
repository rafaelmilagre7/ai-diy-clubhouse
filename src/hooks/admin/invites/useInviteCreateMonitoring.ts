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
  }) => {
    const logData = {
      event: 'invite_creation_performance',
      timestamp: new Date().toISOString(),
      ...data
    };

    // Log estruturado para monitoramento
    console.log('📊 [INVITE-METRICS]', JSON.stringify(logData));

    // Alertas para performance
    if (data.creationTime > 10000) { // > 10 segundos
      toast.warning('⚠️ Sistema lento detectado', {
        description: `Criação de convite demorou ${Math.round(data.creationTime / 1000)}s`
      });
    }

    if (data.creationTime > 30000) { // > 30 segundos
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
  }) => {
    const logData = {
      event: 'edge_function_performance',
      timestamp: new Date().toISOString(),
      ...data
    };

    console.log('🔍 [EDGE-FUNCTION-METRICS]', JSON.stringify(logData));

    // Alertas para Edge Functions
    if (data.duration > 8000 && !data.success) {
      console.warn(`⚠️ Edge Function ${data.functionName} está lenta: ${data.duration}ms`);
    }
  }, []);

  return {
    logInviteCreationMetrics,
    logEdgeFunctionPerformance
  };
};