
import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseWithExtendedTimeout } from '@/lib/supabase';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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
  testType?: string;
  fallbackUsed?: boolean;
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
    logger.info('🔍 [RESEND-HEALTH] Iniciando verificação otimizada');
    setIsChecking(true);
    
    const startTime = Date.now();
    const maxAttempts = forceRefresh ? 3 : 2;
    
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        logger.info(`🔄 [RESEND-HEALTH] Tentativa ${attempt}/${maxAttempts}`);
        
        try {
          // Primeira tentativa: Cliente Supabase com timeout estendido
          if (attempt === 1) {
            logger.info('🔧 [RESEND-HEALTH] Usando cliente Supabase otimizado');
            
            const { data, error } = await supabaseWithExtendedTimeout.functions.invoke('test-resend-health', {
              body: { 
                forceRefresh,
                attempt,
                timestamp: new Date().toISOString(),
                testType: 'supabase_extended'
              },
              headers: {
                'Content-Type': 'application/json',
                'X-Function-Timeout': '60000'
              }
            });

            const responseTime = Date.now() - startTime;

            setDebugInfo({
              timestamp: new Date().toISOString(),
              attempts: attempt,
              method: 'POST',
              responseStatus: error ? 500 : 200,
              errorDetails: error?.message,
              testType: 'supabase_extended',
              fallbackUsed: false
            });

            if (!error && data) {
              logger.info('✅ [RESEND-HEALTH] Sucesso com cliente otimizado');
              
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
                return;
              }
            } else {
              logger.warn(`⚠️ [RESEND-HEALTH] Cliente Supabase falhou: ${error?.message}`);
            }
          }

          // Segunda tentativa: Fallback para fetch direto
          if (attempt === 2 || (attempt === 1 && forceRefresh)) {
            logger.info('🔄 [RESEND-HEALTH] Usando fallback direto');
            
            const directResult = await resendTestService.testHealthWithDirectFetch(attempt, forceRefresh);
            const responseTime = Date.now() - startTime;

            setDebugInfo({
              timestamp: new Date().toISOString(),
              attempts: attempt,
              method: 'POST',
              responseStatus: directResult.healthy ? 200 : 500,
              errorDetails: directResult.lastError,
              testType: 'direct_fetch',
              fallbackUsed: true
            });

            setHealthStatus({
              ...directResult,
              responseTime,
              lastChecked: new Date(),
            });

            if (directResult.healthy) {
              toast.success('Sistema operacional (via fallback)');
              return;
            } else {
              logger.warn(`⚠️ [RESEND-HEALTH] Fallback falhou: ${directResult.lastError}`);
            }
          }

          // Aguardar antes da próxima tentativa
          if (attempt < maxAttempts) {
            const delay = Math.min(2000 * attempt, 5000);
            logger.info(`⏳ [RESEND-HEALTH] Aguardando ${delay}ms antes da próxima tentativa`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

        } catch (attemptError: any) {
          logger.error(`❌ [RESEND-HEALTH] Erro na tentativa ${attempt}:`, attemptError);
          
          if (attempt === maxAttempts) {
            setHealthStatus({
              isHealthy: false,
              apiKeyValid: false,
              connectivity: 'error',
              domainValid: false,
              responseTime: Date.now() - startTime,
              issues: [`Erro após ${maxAttempts} tentativas: ${attemptError.message}`],
              lastError: attemptError.message,
              lastChecked: new Date(),
            });

            setDebugInfo({
              timestamp: new Date().toISOString(),
              attempts: attempt,
              method: 'POST',
              errorDetails: attemptError.message,
              testType: 'failed_all'
            });
          }
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      toast.error('Sistema com problemas - todas as tentativas falharam');

    } catch (err: any) {
      logger.error('❌ [RESEND-HEALTH] Erro crítico:', err);
      
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
        errorDetails: err.message,
        testType: 'critical_error'
      });
      
      toast.error('Erro crítico na verificação');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const forceHealthCheck = useCallback(() => performHealthCheck(true), [performHealthCheck]);

  const sendTestEmail = useCallback(async (email: string) => {
    logger.info('📧 [RESEND-TEST] Enviando email com fallback automático');
    setIsChecking(true);
    
    try {
      // Primeira tentativa: Cliente Supabase
      try {
        const { data, error } = await supabase.functions.invoke('test-resend-email', {
          body: { email },
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!error && data) {
          logger.info('✅ [RESEND-TEST] Email enviado via Supabase');
          toast.success(`Email de teste enviado para ${email}`);
          return { success: true, data };
        } else {
          logger.warn('⚠️ [RESEND-TEST] Supabase falhou, tentando fallback');
        }
      } catch (supabaseError) {
        logger.warn('⚠️ [RESEND-TEST] Erro Supabase, usando fallback:', supabaseError);
      }

      // Fallback: Fetch direto
      const directResult = await resendTestService.sendTestEmailDirect(email);
      
      if (directResult.success) {
        toast.success(`Email enviado para ${email} (via fallback)`);
        return directResult;
      } else {
        toast.error(`Erro ao enviar email: ${directResult.error}`);
        return directResult;
      }

    } catch (err: any) {
      logger.error('❌ [RESEND-TEST] Erro crítico:', err);
      toast.error(`Erro crítico: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Verificação inicial otimizada
  useEffect(() => {
    const timer = setTimeout(() => {
      performHealthCheck();
    }, 500); // Reduzido para 500ms

    return () => clearTimeout(timer);
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
