
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
  edgeFunctionStatus: 'working' | 'failed' | 'unknown';
  connectionError?: string;
}

export const useResendHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<ResendHealthStatus>({
    isHealthy: false,
    apiKeyStatus: 'unknown' as any,
    domainStatus: 'unknown',
    emailCapability: 'error',
    lastTestEmail: null,
    issues: ['Verificação pendente'],
    recommendations: ['Aguarde a verificação inicial'],
    checkedAt: new Date(),
    edgeFunctionStatus: 'unknown'
  });
  const [isChecking, setIsChecking] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      console.log('🔍 [RESEND-HEALTH] Iniciando verificação do sistema de email...');
      
      // Testar conectividade com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na Edge Function')), 10000)
      );

      const healthCheckPromise = supabase.functions.invoke('test-resend-health');
      
      const { data, error } = await Promise.race([
        healthCheckPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('❌ [RESEND-HEALTH] Erro na Edge Function:', error);
        issues.push(`Falha na Edge Function: ${error.message}`);
        recommendations.push('Verificar logs da Edge Function no Supabase');
        recommendations.push('Verificar se o projeto está conectado ao Supabase');
        
        setHealthStatus({
          isHealthy: false,
          apiKeyStatus: 'error',
          domainStatus: 'unknown',
          emailCapability: 'error',
          lastTestEmail: null,
          issues,
          recommendations,
          checkedAt: new Date(),
          edgeFunctionStatus: 'failed',
          connectionError: error.message
        });
        return;
      }

      console.log('✅ [RESEND-HEALTH] Edge Function respondeu:', data);
      
      const result = data?.health || {};
      
      // Analisar status da API key
      let apiKeyStatus: ResendHealthStatus['apiKeyStatus'] = 'valid';
      if (result.apiKeyMissing) {
        apiKeyStatus = 'missing';
        issues.push('API key do Resend não está configurada');
        recommendations.push('Configurar RESEND_API_KEY nas secrets do Supabase');
        recommendations.push('Obter API key em https://resend.com/api-keys');
      } else if (!result.apiKeyValid) {
        apiKeyStatus = 'invalid';
        issues.push('API key do Resend é inválida');
        recommendations.push('Verificar se a API key está correta');
        recommendations.push('Regenerar API key no painel do Resend');
      }

      // Analisar status do domínio
      let domainStatus: ResendHealthStatus['domainStatus'] = 'verified';
      if (!result.domainVerified) {
        domainStatus = 'failed';
        issues.push('Domínio viverdeia.ai não está verificado no Resend');
        recommendations.push('Verificar configurações DNS em https://resend.com/domains');
        recommendations.push('Adicionar registros DNS necessários para verificação');
      }

      // Analisar capacidade de envio
      let emailCapability: ResendHealthStatus['emailCapability'] = 'operational';
      if (result.quotaExceeded) {
        emailCapability = 'limited';
        issues.push('Quota de emails do Resend foi atingida');
        recommendations.push('Upgradar plano do Resend ou aguardar reset da quota');
      }

      // Determinar saúde geral
      const isHealthy = issues.length === 0;

      setHealthStatus({
        isHealthy,
        apiKeyStatus,
        domainStatus,
        emailCapability,
        lastTestEmail: result.lastTestEmail ? new Date(result.lastTestEmail) : null,
        issues,
        recommendations,
        checkedAt: new Date(),
        edgeFunctionStatus: 'working'
      });

      console.log(`✅ [RESEND-HEALTH] Verificação concluída - Status: ${isHealthy ? 'Saudável' : 'Com problemas'}`);

    } catch (error: any) {
      console.error('❌ [RESEND-HEALTH] Erro na verificação:', error);
      
      let errorMessage = 'Erro na verificação do sistema';
      let connectionError = error.message;
      
      if (error.message?.includes('Timeout')) {
        errorMessage = 'Edge Function não respondeu (timeout)';
        recommendations.push('Verificar se as Edge Functions estão funcionando');
        recommendations.push('Tentar novamente em alguns minutos');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Erro de conectividade';
        recommendations.push('Verificar conexão com a internet');
        recommendations.push('Verificar status do Supabase');
      }
      
      setHealthStatus({
        isHealthy: false,
        apiKeyStatus: 'error',
        domainStatus: 'unknown',
        emailCapability: 'error',
        lastTestEmail: null,
        issues: [errorMessage],
        recommendations,
        checkedAt: new Date(),
        edgeFunctionStatus: 'failed',
        connectionError
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  const sendTestEmail = useCallback(async (email: string) => {
    if (!email?.includes('@')) {
      toast.error('Email inválido');
      return { success: false, error: 'Email inválido' };
    }

    try {
      console.log('📧 [RESEND-HEALTH] Enviando email de teste para:', email);
      
      const { data, error } = await supabase.functions.invoke('test-resend-email', {
        body: { email }
      });

      if (error) {
        console.error('❌ [RESEND-HEALTH] Erro no envio:', error);
        throw error;
      }

      console.log('✅ [RESEND-HEALTH] Email enviado com sucesso:', data);
      
      toast.success('Email de teste enviado com sucesso!', {
        description: `Enviado para ${email}`,
        duration: 5000
      });
      
      // Atualizar status após teste bem-sucedido
      performHealthCheck();
      
      return { success: true, emailId: data?.emailId };
    } catch (error: any) {
      console.error('❌ [RESEND-HEALTH] Falha no envio:', error);
      
      let errorMessage = 'Falha no envio do email';
      if (error.message?.includes('API key')) {
        errorMessage = 'API key do Resend inválida';
      } else if (error.message?.includes('domain')) {
        errorMessage = 'Problema com o domínio';
      }
      
      toast.error(errorMessage, {
        description: error.message,
        duration: 8000
      });
      
      return { success: false, error: error.message };
    }
  }, [performHealthCheck]);

  useEffect(() => {
    performHealthCheck();
    
    // Verificar a cada 5 minutos em vez de 10
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [performHealthCheck]);

  return {
    healthStatus,
    isChecking,
    performHealthCheck,
    sendTestEmail
  };
};
