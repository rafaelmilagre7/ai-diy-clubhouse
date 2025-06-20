
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
  debugInfo?: any;
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

  const performHealthCheck = useCallback(async (forceRefresh: boolean = false) => {
    setIsChecking(true);
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      console.log('🔍 [RESEND-HEALTH] Iniciando verificação do sistema de email...', {
        forceRefresh,
        timestamp: new Date().toISOString()
      });
      
      // Timeout aumentado para 30 segundos
      const timeoutDuration = 30000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout de ${timeoutDuration/1000}s na Edge Function`)), timeoutDuration)
      );

      const healthCheckPromise = supabase.functions.invoke('test-resend-health', {
        body: { force_refresh: forceRefresh }
      });
      
      console.log('⏱️ [RESEND-HEALTH] Aguardando resposta da Edge Function...');
      const startTime = Date.now();
      
      const { data, error } = await Promise.race([
        healthCheckPromise,
        timeoutPromise
      ]) as any;
      
      const duration = Date.now() - startTime;
      console.log(`⚡ [RESEND-HEALTH] Edge Function respondeu em ${duration}ms`);
      
      if (error) {
        console.error('❌ [RESEND-HEALTH] Erro na Edge Function:', error);
        issues.push(`Falha na Edge Function: ${error.message}`);
        
        // Recomendações específicas baseadas no tipo de erro
        if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
          recommendations.push('A Edge Function está demorando muito para responder');
          recommendations.push('Tente forçar uma atualização usando o botão "Forçar Verificação"');
        } else if (error.message?.includes('not found') || error.message?.includes('404')) {
          recommendations.push('A Edge Function test-resend-health não foi encontrada');
          recommendations.push('Verificar se a função foi deployada corretamente');
        } else {
          recommendations.push('Verificar logs da Edge Function no Supabase');
          recommendations.push('Verificar se o projeto está conectado ao Supabase');
        }
        
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

      console.log('✅ [RESEND-HEALTH] Edge Function respondeu com sucesso:', data);
      
      const result = data?.health || {};
      
      // Analisar status da API key com mais detalhes
      let apiKeyStatus: ResendHealthStatus['apiKeyStatus'] = 'valid';
      if (result.apiKeyMissing) {
        apiKeyStatus = 'missing';
        issues.push('API key do Resend não está configurada');
        recommendations.push('1. Acesse https://resend.com/api-keys');
        recommendations.push('2. Crie uma nova API key se necessário');
        recommendations.push('3. Configure RESEND_API_KEY nas secrets do Supabase');
      } else if (!result.apiKeyValid) {
        apiKeyStatus = 'invalid';
        issues.push('API key do Resend é inválida ou expirada');
        
        if (result.debug?.api_key_info?.format_valid === false) {
          recommendations.push('API key deve começar com "re_"');
        }
        
        recommendations.push('Verificar se a API key está correta no Supabase');
        recommendations.push('Regenerar API key no painel do Resend se necessário');
        recommendations.push('Aguardar 5-10 minutos após configurar nova key');
      }

      // Analisar status do domínio
      let domainStatus: ResendHealthStatus['domainStatus'] = 'verified';
      if (!result.domainVerified) {
        domainStatus = 'failed';
        issues.push('Domínio viverdeia.ai não está verificado no Resend');
        recommendations.push('1. Acessar https://resend.com/domains');
        recommendations.push('2. Verificar configurações DNS do domínio');
        recommendations.push('3. Adicionar registros DNS necessários');
      }

      // Analisar capacidade de envio
      let emailCapability: ResendHealthStatus['emailCapability'] = 'operational';
      if (result.quotaExceeded) {
        emailCapability = 'limited';
        issues.push('Quota de emails do Resend foi atingida');
        recommendations.push('Verificar uso na dashboard do Resend');
        recommendations.push('Upgradar plano ou aguardar reset da quota');
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
        edgeFunctionStatus: 'working',
        debugInfo: result.debug
      });

      console.log(`✅ [RESEND-HEALTH] Verificação concluída em ${duration}ms - Status: ${isHealthy ? 'Saudável' : 'Com problemas'}`);

      // Toast de sucesso para verificações forçadas
      if (forceRefresh && isHealthy) {
        toast.success('Verificação forçada concluída', {
          description: 'Sistema de email está funcionando normalmente',
          duration: 3000
        });
      }

    } catch (error: any) {
      console.error('❌ [RESEND-HEALTH] Erro na verificação:', error);
      
      let errorMessage = 'Erro na verificação do sistema';
      let connectionError = error.message;
      
      if (error.message?.includes('Timeout')) {
        errorMessage = 'Edge Function não respondeu (timeout de 30s)';
        recommendations.push('A verificação está demorando muito');
        recommendations.push('Verificar se as Edge Functions estão funcionando');
        recommendations.push('Tentar "Forçar Verificação" novamente');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Erro de conectividade';
        recommendations.push('Verificar conexão com a internet');
        recommendations.push('Verificar status do Supabase');
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Erro de autenticação';
        recommendations.push('Fazer login novamente');
        recommendations.push('Verificar permissões do usuário');
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

      // Toast de erro
      toast.error('Falha na verificação', {
        description: errorMessage,
        duration: 5000
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
      
      // Timeout de 30s para envio de email também
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no envio de email')), 30000)
      );

      const emailPromise = supabase.functions.invoke('test-resend-email', {
        body: { email }
      });

      const { data, error } = await Promise.race([
        emailPromise,
        timeoutPromise
      ]) as any;

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
      await performHealthCheck();
      
      return { success: true, emailId: data?.emailId };
    } catch (error: any) {
      console.error('❌ [RESEND-HEALTH] Falha no envio:', error);
      
      let errorMessage = 'Falha no envio do email';
      if (error.message?.includes('API key')) {
        errorMessage = 'API key do Resend inválida';
      } else if (error.message?.includes('domain')) {
        errorMessage = 'Problema com o domínio';
      } else if (error.message?.includes('Timeout')) {
        errorMessage = 'Timeout no envio (30s)';
      }
      
      toast.error(errorMessage, {
        description: error.message,
        duration: 8000
      });
      
      return { success: false, error: error.message };
    }
  }, [performHealthCheck]);

  // Forçar verificação
  const forceHealthCheck = useCallback(() => {
    console.log('🔄 [RESEND-HEALTH] Forçando nova verificação...');
    toast.info('Forçando nova verificação...', {
      description: 'Aguarde, isso pode levar até 30 segundos',
      duration: 3000
    });
    return performHealthCheck(true);
  }, [performHealthCheck]);

  useEffect(() => {
    performHealthCheck();
    
    // Verificar a cada 10 minutos (mais espaçado)
    const interval = setInterval(() => performHealthCheck(), 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [performHealthCheck]);

  return {
    healthStatus,
    isChecking,
    performHealthCheck,
    forceHealthCheck,
    sendTestEmail
  };
};
