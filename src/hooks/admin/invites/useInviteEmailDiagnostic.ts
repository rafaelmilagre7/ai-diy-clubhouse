
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DiagnosticResult {
  resendConfigured: boolean;
  edgeFunctionExists: boolean;
  recentInvites: any[];
  failedInvites: any[];
  systemHealth: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
}

export const useInviteEmailDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticResult | null>(null);

  const runDiagnostic = useCallback(async (): Promise<DiagnosticResult> => {
    setIsRunning(true);
    console.log('🔍 [DIAGNOSTIC] Iniciando diagnóstico do sistema de convites...');

    try {
      const result: DiagnosticResult = {
        resendConfigured: false,
        edgeFunctionExists: false,
        recentInvites: [],
        failedInvites: [],
        systemHealth: 'critical',
        recommendations: []
      };

      // 1. Testar Edge Function
      try {
        console.log('🧪 [DIAGNOSTIC] Testando Edge Function...');
        const { data, error } = await supabase.functions.invoke('send-invite-email', {
          body: {
            email: 'test@example.com',
            inviteUrl: 'https://test.com',
            roleName: 'teste',
            expiresAt: new Date().toISOString(),
            forceResend: false
          }
        });

        if (!error || error.message.includes('test@example.com')) {
          result.edgeFunctionExists = true;
          console.log('✅ [DIAGNOSTIC] Edge Function existe e responde');
        }
      } catch (edgeError) {
        console.log('❌ [DIAGNOSTIC] Edge Function com problema:', edgeError);
        result.recommendations.push('Verificar se a Edge Function send-invite-email está configurada');
      }

      // 2. Buscar convites recentes (últimos 7 dias)
      try {
        const { data: recentInvites, error: invitesError } = await supabase
          .from('invites')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (!invitesError && recentInvites) {
          result.recentInvites = recentInvites;
          console.log(`📊 [DIAGNOSTIC] ${recentInvites.length} convites recentes encontrados`);
        }
      } catch (invitesError) {
        console.log('⚠️ [DIAGNOSTIC] Erro ao buscar convites:', invitesError);
      }

      // 3. Buscar tentativas de envio falhadas
      try {
        const { data: failedAttempts, error: failedError } = await supabase
          .from('invite_send_attempts')
          .select('*')
          .eq('status', 'failed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!failedError && failedAttempts) {
          result.failedInvites = failedAttempts;
          console.log(`🚨 [DIAGNOSTIC] ${failedAttempts.length} tentativas falhadas encontradas`);
        }
      } catch (failedError) {
        console.log('⚠️ [DIAGNOSTIC] Erro ao buscar falhas:', failedError);
      }

      // 4. Determinar saúde do sistema
      if (result.edgeFunctionExists && result.failedInvites.length === 0) {
        result.systemHealth = 'healthy';
      } else if (result.edgeFunctionExists && result.failedInvites.length < 3) {
        result.systemHealth = 'warning';
      } else {
        result.systemHealth = 'critical';
      }

      // 5. Gerar recomendações
      if (!result.edgeFunctionExists) {
        result.recommendations.push('Configurar Edge Function send-invite-email');
      }
      
      if (result.failedInvites.length > 0) {
        result.recommendations.push(`${result.failedInvites.length} convites falharam - verificar logs`);
      }
      
      if (result.recentInvites.length === 0) {
        result.recommendations.push('Nenhum convite recente - testar sistema');
      }

      result.recommendations.push('Verificar se RESEND_API_KEY está configurada no Supabase');
      result.recommendations.push('Validar domínio no Resend.com');

      setLastDiagnostic(result);
      
      // Feedback para o usuário
      switch (result.systemHealth) {
        case 'healthy':
          toast.success('Sistema de convites funcionando normalmente');
          break;
        case 'warning':
          toast.warning('Sistema de convites com alguns problemas menores');
          break;
        case 'critical':
          toast.error('Sistema de convites precisa de atenção');
          break;
      }

      return result;

    } catch (error: any) {
      console.error('❌ [DIAGNOSTIC] Erro no diagnóstico:', error);
      toast.error('Erro ao executar diagnóstico');
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const testInviteEmail = useCallback(async (testEmail: string) => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Email de teste inválido');
      return false;
    }

    try {
      console.log('🧪 [TEST] Enviando convite de teste para:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: testEmail,
          inviteUrl: `${window.location.origin}/convite/teste-123`,
          roleName: 'Teste',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Teste',
          notes: 'Este é um teste do sistema de convites',
          forceResend: true
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success(`Convite de teste enviado para ${testEmail}!`, {
          description: `Método: ${data.strategy || 'desconhecido'}`
        });
        return true;
      }

      throw new Error(data?.error || 'Falha no envio');

    } catch (error: any) {
      console.error('❌ [TEST] Erro no teste:', error);
      toast.error('Falha no teste de envio', {
        description: error.message
      });
      return false;
    }
  }, []);

  return {
    runDiagnostic,
    testInviteEmail,
    isRunning,
    lastDiagnostic
  };
};
