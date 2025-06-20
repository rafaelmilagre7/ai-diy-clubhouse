
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface HealthCheckStatus {
  isHealthy: boolean;
  apiKeyValid: boolean;
  connectivity: 'connected' | 'disconnected' | 'unknown';
  domainValid: boolean;
  responseTime: number;
  lastChecked: Date;
  lastError?: string;
  issues: string[];
}

export const useResendHealthCheck = () => {
  const [status, setStatus] = useState<HealthCheckStatus>({
    isHealthy: false,
    apiKeyValid: false,
    connectivity: 'unknown',
    domainValid: false,
    responseTime: 0,
    lastChecked: new Date(),
    issues: []
  });
  
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      setIsChecking(true);
      
      console.log("🔍 Iniciando verificação de saúde do sistema Resend...");
      
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('test-resend-health', {
        body: {
          forceRefresh: true,
          attempt: 1,
          timestamp: new Date().toISOString(),
          testType: 'direct_fetch',
          requestId: crypto.randomUUID().substring(0, 8),
          userAgent: navigator.userAgent.substring(0, 100),
          clientInfo: 'viverdeia-direct-test'
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error("❌ Erro na verificação de saúde:", error);
        
        setStatus({
          isHealthy: false,
          apiKeyValid: false,
          connectivity: 'disconnected',
          domainValid: false,
          responseTime,
          lastChecked: new Date(),
          lastError: error.message,
          issues: [
            'Falha na comunicação com sistema de email',
            'Verifique configurações do Resend',
            error.message
          ]
        });
        return;
      }

      if (!data?.success) {
        console.error("❌ Sistema reportou falha:", data);
        
        setStatus({
          isHealthy: false,
          apiKeyValid: data?.apiKeyValid || false,
          connectivity: data?.connectivity || 'disconnected',
          domainValid: data?.domainValid || false,
          responseTime,
          lastChecked: new Date(),
          lastError: data?.error || 'Sistema indisponível',
          issues: data?.issues || ['Sistema de email indisponível']
        });
        return;
      }

      // Sucesso
      console.log("✅ Verificação de saúde concluída com sucesso:", data);
      
      setStatus({
        isHealthy: true,
        apiKeyValid: true,
        connectivity: 'connected',
        domainValid: true,
        responseTime,
        lastChecked: new Date(),
        issues: []
      });

    } catch (error: any) {
      console.error("❌ Erro crítico na verificação:", error);
      
      setStatus({
        isHealthy: false,
        apiKeyValid: false,
        connectivity: 'disconnected',
        domainValid: false,
        responseTime: 0,
        lastChecked: new Date(),
        lastError: error.message,
        issues: [
          'Erro crítico no sistema de verificação',
          'Sistema pode estar indisponível',
          error.message
        ]
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    status,
    isChecking,
    checkHealth
  };
};
