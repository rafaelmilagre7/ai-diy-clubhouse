
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useResetPassword = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetUserPassword = async (userEmail: string) => {
    try {
      setIsResetting(true);
      setError(null);

      // Solicitar redefinição de senha usando nossa edge function
      const { error } = await supabase.functions.invoke('send-reset-password-email', {
        body: {
          email: userEmail,
          resetUrl: `${window.location.origin}/set-new-password`
        }
      });

      if (error) {
        throw error;
      }

      // Registrar a ação no log de auditoria
      await supabase.rpc('log_permission_change', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'reset_password',
        old_value: userEmail
      });

      toast.success('Email de redefinição de senha enviado', {
        description: `Um email foi enviado para ${userEmail} com instruções para redefinir a senha.`
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      setError(err);
      
      toast.error('Erro ao enviar email de redefinição de senha', {
        description: err.message || 'Não foi possível enviar o email de redefinição de senha. Tente novamente mais tarde.'
      });
      
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
