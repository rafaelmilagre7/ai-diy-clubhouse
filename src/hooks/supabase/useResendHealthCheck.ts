
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ResendHealthStatus {
  isHealthy: boolean;
  apiKeyValid: boolean;
  connectivity: 'connected' | 'disconnected' | 'error';
  domainValid: boolean;
  responseTime?: number;
  issues: string[];
  lastError?: string;
  lastChecked?: Date;
}

interface DebugInfo {
  timestamp: string;
  attempts: number;
  method: string;
  responseStatus?: number;
  errorDetails?: string;
  headers?: Record<string, any>;
}

export const useResendHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<ResendHealthStatus>({
    isHealthy: false,
    apiKeyValid: false,
    connectivity: 'disconnected',
    domainValid: false,
    issues: [],
    lastChecked: undefined,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const performHealthCheck = useCallback(async (forceRefresh = false) => {
    console.log('🔍 [RESEND-HEALTH] Iniciando verificação de saúde do Resend...');
    setIsChecking(true);
    
    const startTime = Date.now();
    const attempts = forceRefresh ? 3 : 1;
    
    try {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        console.log(`🔄 [RESEND-HEALTH] Tentativa ${attempt}/${attempts}`);
        
        const { data, error } = await supabase.functions.invoke('test-resend-health', {
          body: { 
            forceRefresh,
            attempt,
            timestamp: new Date().toISOString()
          }
        });

        const responseTime = Date.now() - startTime;

        setDebugInfo({
          timestamp: new Date().toISOString(),
          attempts: attempt,
          method: 'POST',
          responseStatus: error ? 500 : 200,
          errorDetails: error?.message,
          headers: data?.headers
        });

        if (!error && data) {
          console.log('✅ [RESEND-HEALTH] Verificação bem-sucedida:', data);
          
          setHealthStatus({
            isHealthy: data.healthy || false,
            apiKeyValid: data.apiKeyValid || false,
            connectivity: data.connectivity || 'disconnected',
            domainValid: data.domainValid || false,
            responseTime,
            issues: data.issues || [],
            lastError: data.lastError,
            lastChecked: new Date(),
          });
          
          if (data.healthy) {
            toast.success('Sistema de email operacional');
            break;
          } else if (attempt === attempts) {
            toast.warning('Sistema com problemas detectados');
          }
        } else {
          console.error(`❌ [RESEND-HEALTH] Erro na tentativa ${attempt}:`, error);
          
          if (attempt === attempts) {
            setHealthStatus({
              isHealthy: false,
              apiKeyValid: false,
              connectivity: 'error',
              domainValid: false,
              responseTime,
              issues: [`Erro na comunicação: ${error?.message || 'Desconhecido'}`],
              lastError: error?.message,
              lastChecked: new Date(),
            });
            
            toast.error('Falha na verificação do sistema de email');
          }
        }
        
        // Aguardar antes da próxima tentativa
        if (attempt < attempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (err: any) {
      console.error('❌ [RESEND-HEALTH] Erro geral:', err);
      
      setHealthStatus({
        isHealthy: false,
        apiKeyValid: false,
        connectivity: 'error',
        domainValid: false,
        responseTime: Date.now() - startTime,
        issues: [`Erro crítico: ${err.message}`],
        lastError: err.message,
        lastChecked: new Date(),
      });
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        attempts: 1,
        method: 'POST',
        errorDetails: err.message
      });
      
      toast.error('Erro crítico na verificação');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const forceHealthCheck = useCallback(() => performHealthCheck(true), [performHealthCheck]);

  const sendTestEmail = useCallback(async (email: string) => {
    console.log('📧 [RESEND-TEST] Enviando email de teste para:', email);
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-resend-email', {
        body: { email }
      });

      if (error) {
        console.error('❌ [RESEND-TEST] Erro:', error);
        toast.error(`Erro ao enviar email: ${error.message}`);
        return { success: false, error: error.message };
      }

      console.log('✅ [RESEND-TEST] Email enviado:', data);
      toast.success(`Email de teste enviado para ${email}`);
      return { success: true, data };
    } catch (err: any) {
      console.error('❌ [RESEND-TEST] Erro crítico:', err);
      toast.error(`Erro crítico: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Verificação inicial
  useEffect(() => {
    performHealthCheck();
  }, [performHealthCheck]);

  return {
    healthStatus,
    isChecking,
    performHealthCheck,
    forceHealthCheck,
    sendTestEmail,
    debugInfo
  };
};
