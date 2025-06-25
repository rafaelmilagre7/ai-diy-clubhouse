
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

interface InviteRegistrationData {
  email: string;
  name: string;
  password: string;
  token: string;
}

export const useInviteRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const registerWithInvite = async (data: InviteRegistrationData) => {
    setIsRegistering(true);
    
    try {
      logger.info('Iniciando registro via convite', {
        email: data.email,
        name: data.name,
        token: data.token.substring(0, 8) + '***'
      });

      // 1. Verificar se o email já existe usando listUsers
      const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) {
        logger.error('Erro ao verificar usuários existentes', { error: searchError.message });
        toast.error('Erro ao verificar usuários existentes');
        return { 
          success: false, 
          error: 'user_check_failed',
          message: 'Erro ao verificar usuários existentes'
        };
      }

      // Verificar se algum usuário tem o email desejado - corrigir tipagem
      const existingUser = existingUsers.users?.find((user: any) => user.email === data.email);
      
      if (existingUser) {
        logger.warn('Email já existe no sistema', { email: data.email });
        toast.error('Este e-mail já possui uma conta. Faça login ao invés de criar uma nova conta.');
        return { 
          success: false, 
          error: 'user_exists',
          message: 'Email já cadastrado no sistema'
        };
      }

      // 2. Criar conta no Supabase Auth
      logger.info('Criando conta no Supabase Auth', { email: data.email });
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            invite_token: data.token
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        logger.error('Erro na criação da conta', { error: authError.message });
        toast.error(`Erro ao criar conta: ${authError.message}`);
        return { 
          success: false, 
          error: 'auth_error',
          message: authError.message 
        };
      }

      if (!authData.user) {
        logger.error('Usuário não foi criado', {});
        toast.error('Erro ao criar usuário');
        return { 
          success: false, 
          error: 'user_creation_failed',
          message: 'Falha na criação do usuário'
        };
      }

      logger.info('Conta criada com sucesso', {
        userId: authData.user.id,
        email: authData.user.email
      });

      // 3. Processar convite via RPC
      logger.info('Processando convite', { token: data.token.substring(0, 8) + '***' });
      const { data: inviteResult, error: inviteError } = await supabase.rpc(
        'complete_invite_registration',
        {
          p_token: data.token,
          p_user_id: authData.user.id
        }
      );

      if (inviteError || !inviteResult?.success) {
        const errorMessage = inviteError?.message || inviteResult?.message || 'Erro ao processar convite';
        logger.error('Erro no processamento do convite', { error: errorMessage });
        toast.error(`Erro ao processar convite: ${errorMessage}`);
        return { 
          success: false, 
          error: 'invite_processing_failed',
          message: errorMessage 
        };
      }

      // 4. Atualizar nome se foi modificado
      if (data.name) {
        logger.info('Atualizando nome do usuário', { name: data.name });
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name: data.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);

        if (profileError) {
          logger.warn('Erro ao atualizar nome', { error: profileError.message });
          // Não falha o processo por causa disso
        }
      }

      // 5. Limpar token e finalizar
      InviteTokenManager.clearTokenOnSuccess();
      
      logger.info('Registro via convite concluído com sucesso', {});
      toast.success('Conta criada com sucesso! Bem-vindo(a) ao Viver de IA!');
      
      // Aguardar um pouco para o toast aparecer e depois navegar
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

      return { success: true };

    } catch (error: any) {
      logger.error('Erro inesperado', { error: error.message });
      toast.error(`Erro inesperado: ${error.message}`);
      return { 
        success: false, 
        error: 'unexpected_error',
        message: error.message 
      };
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registerWithInvite,
    isRegistering
  };
};
