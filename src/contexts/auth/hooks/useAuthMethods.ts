
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  inviteToken?: string;
}

interface RegisterResult {
  user?: any;
  error?: any;
}

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const registerWithInvite = async (params: RegisterParams): Promise<RegisterResult> => {
    try {
      setIsLoading(true);
      
      logger.info('Iniciando registro com convite', {
        component: 'useAuthMethods',
        email: params.email,
        hasInviteToken: !!params.inviteToken
      });

      // Log tentativa de registro
      await auditLogger.logUserRegistration('register_attempt', {
        email: params.email,
        has_invite_token: !!params.inviteToken
      });

      // Tentar registrar o usuário
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: params.name,
            invite_token: params.inviteToken
          }
        }
      });

      if (error) {
        logger.error('Erro no registro do usuário', {
          component: 'useAuthMethods',
          error: error.message,
          email: params.email
        });

        await auditLogger.logUserRegistration('register_failed', {
          email: params.email,
          error: error.message
        });

        return { error };
      }

      if (!data.user) {
        const errorMsg = 'Usuário não foi criado';
        logger.error(errorMsg, {
          component: 'useAuthMethods',
          email: params.email
        });

        await auditLogger.logUserRegistration('register_failed', {
          email: params.email,
          error: errorMsg
        });

        return { error: new Error(errorMsg) };
      }

      logger.info('Usuário registrado com sucesso', {
        component: 'useAuthMethods',
        user_id: data.user.id,
        email: params.email
      });

      // Se há token de convite, completar o processo
      if (params.inviteToken) {
        try {
          const { error: completeError } = await supabase.rpc('complete_invite_registration', {
            p_token: params.inviteToken,
            p_user_id: data.user.id
          });

          if (completeError) {
            logger.warn('Erro ao completar registro com convite (não crítico)', {
              component: 'useAuthMethods',
              error: completeError.message,
              user_id: data.user.id
            });
            
            await auditLogger.logInviteProcess('invite_completion_failed', params.inviteToken, {
              user_id: data.user.id,
              error: completeError.message
            });
          } else {
            await auditLogger.logInviteProcess('invite_completion_success', params.inviteToken, {
              user_id: data.user.id
            });
          }
        } catch (inviteError: any) {
          logger.warn('Erro inesperado ao processar convite', {
            component: 'useAuthMethods',
            error: inviteError.message,
            user_id: data.user.id
          });
        }
      }

      await auditLogger.logUserRegistration('register_success', {
        email: params.email,
        user_id: data.user.id
      });

      return { user: data.user };

    } catch (error: any) {
      logger.error('Erro inesperado no registro', {
        component: 'useAuthMethods',
        error: error.message,
        email: params.email
      });

      await auditLogger.logUserRegistration('register_error', {
        email: params.email,
        error: error.message
      });

      return { error };

    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerWithInvite,
    isLoading
  };
};
