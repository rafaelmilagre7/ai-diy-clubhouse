
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { APP_CONFIG } from '@/config/app';
import { showModernLoading, showModernSuccess, showModernError, dismissModernToast } from '@/lib/toast-helpers';

export const useResetPassword = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetUserPassword = async (userEmail: string) => {
    const loadingToastId = showModernLoading(
      'Enviando e-mail',
      'Preparando link de redefinição de senha...'
    );
    
    try {
      setIsResetting(true);
      setError(null);

      console.log('🔐 Iniciando reset de senha para:', userEmail);

      // Usar sempre o domínio personalizado para reset de senha
      const { data, error } = await supabase.functions.invoke('send-reset-password-email', {
        body: {
          email: userEmail,
          resetUrl: APP_CONFIG.getAppUrl('/set-new-password')
        }
      });

      console.log('📧 Resposta da edge function:', { data, error });

      if (error) {
        console.error('❌ Erro retornado pela função:', error);
        throw new Error(error.message || 'Falha ao chamar função de reset de senha');
      }

      // Verificar se a resposta indica sucesso
      if (data && !data.success) {
        console.error('❌ Função retornou erro:', data);
        throw new Error(data.error || data.details || 'Erro ao processar reset de senha');
      }

      console.log('✅ Email enviado com sucesso:', data);

      // Registrar a ação no log de auditoria
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.rpc('log_permission_change', {
            user_id: user.id,
            action_type: 'reset_password',
            old_value: userEmail
          });
        }
      } catch (auditError) {
        console.warn('⚠️ Falha ao registrar log de auditoria:', auditError);
        // Não falhar a operação por causa do log
      }

      dismissModernToast(loadingToastId);
      showModernSuccess(
        'E-mail enviado com sucesso!',
        `Link de redefinição enviado para ${userEmail}`
      );

      return true;
    } catch (err: any) {
      console.error('❌ Erro ao redefinir senha:', err);
      setError(err);
      
      dismissModernToast(loadingToastId);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Não foi possível enviar o email de redefinição de senha.';
      
      if (err.message?.includes('RESEND_API_KEY')) {
        errorMessage = 'Serviço de email não está configurado corretamente.';
      } else if (err.message?.includes('Email inválido')) {
        errorMessage = 'O email fornecido é inválido.';
      } else if (err.message?.includes('domain')) {
        errorMessage = 'Erro na configuração do domínio de email.';
      } else if (err.message?.includes('FunctionsRelayError') || err.message?.includes('FunctionsHttpError')) {
        errorMessage = 'Erro ao conectar com o serviço de email. Tente novamente.';
      }
      
      showModernError(
        'Erro ao enviar e-mail',
        errorMessage,
        { duration: 6000 }
      );
      
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetUserPassword,
    isResetting,
    error
  };
};
