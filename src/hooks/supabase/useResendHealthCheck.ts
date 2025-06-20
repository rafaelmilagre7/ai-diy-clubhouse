
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ResendHealthStatus {
  isHealthy: boolean;
  apiKeyStatus: 'valid' | 'invalid' | 'missing' | 'error';
  domainStatus: 'verified' | 'pending' | 'failed' | 'unknown';
  emailCapability: 'operational' | 'limited' | 'error';
  lastTestEmail: Date | null;
  issues: string[];
  recommendations: string[];
  checkedAt: Date;
}

export const useResendHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<ResendHealthStatus>({
    isHealthy: true,
    apiKeyStatus: 'valid',
    domainStatus: 'verified',
    emailCapability: 'operational',
    lastTestEmail: null,
    issues: [],
    recommendations: [],
    checkedAt: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Testar conectividade com o Resend via edge function
      const { data, error } = await supabase.functions.invoke('test-resend-health');
      
      if (error) {
        issues.push(`Erro na verificação: ${error.message}`);
        setHealthStatus({
          isHealthy: false,
          apiKeyStatus: 'error',
          domainStatus: 'unknown',
          emailCapability: 'error',
          lastTestEmail: null,
          issues,
          recommendations: ['Verificar configuração do Resend', 'Revisar API key'],
          checkedAt: new Date()
        });
        return;
      }

      const result = data?.health || {};
      
      // Analisar status da API key
      let apiKeyStatus: ResendHealthStatus['apiKeyStatus'] = 'valid';
      if (!result.apiKeyValid) {
        apiKeyStatus = result.apiKeyMissing ? 'missing' : 'invalid';
        issues.push('API key do Resend inválida ou ausente');
        recommendations.push('Verificar configuração da API key no painel admin');
      }

      // Analisar status do domínio
      let domainStatus: ResendHealthStatus['domainStatus'] = 'verified';
      if (!result.domainVerified) {
        domainStatus = 'failed';
        issues.push('Domínio não verificado no Resend');
        recommendations.push('Verificar configurações DNS do domínio');
      }

      // Analisar capacidade de envio
      let emailCapability: ResendHealthStatus['emailCapability'] = 'operational';
      if (result.quotaExceeded) {
        emailCapability = 'limited';
        issues.push('Quota de emails atingida');
        recommendations.push('Upgradar plano do Resend ou aguardar reset da quota');
      }

      setHealthStatus({
        isHealthy: issues.length === 0,
        apiKeyStatus,
        domainStatus,
        emailCapability,
        lastTestEmail: result.lastTestEmail ? new Date(result.lastTestEmail) : null,
        issues,
        recommendations,
        checkedAt: new Date()
      });

    } catch (error) {
      console.error('Erro na verificação de saúde do Resend:', error);
      setHealthStatus({
        isHealthy: false,
        apiKeyStatus: 'error',
        domainStatus: 'unknown',
        emailCapability: 'error',
        lastTestEmail: null,
        issues: ['Erro na verificação do sistema'],
        recommendations: ['Verificar logs do sistema'],
        checkedAt: new Date()
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  const sendTestEmail = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('test-resend-email', {
        body: { email }
      });

      if (error) throw error;

      toast.success('Email de teste enviado com sucesso!');
      performHealthCheck(); // Atualizar status após teste
      return { success: true };
    } catch (error: any) {
      toast.error(`Falha no envio: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, [performHealthCheck]);

  useEffect(() => {
    performHealthCheck();
    
    // Verificar a cada 10 minutos
    const interval = setInterval(performHealthCheck, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [performHealthCheck]);

  return {
    healthStatus,
    isChecking,
    performHealthCheck,
    sendTestEmail
  };
};
