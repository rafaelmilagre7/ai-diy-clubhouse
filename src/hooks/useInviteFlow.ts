
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface InviteDetails {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  expires_at: string;
  created_at: string;
}

export interface InviteFlowResult {
  success: boolean;
  message: string;
  requiresOnboarding?: boolean;
}

export const useInviteFlow = (token?: string) => {
  const { user, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchInviteDetails = useCallback(async () => {
    if (!token) {
      setInviteDetails(null);
      setError('');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('[INVITE-FLOW] Buscando detalhes do convite:', token);

      if (token.length < 10) {
        throw new Error('Token de convite inválido');
      }

      const { data: invites, error } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          role_id,
          expires_at,
          created_at,
          used_at,
          user_roles:role_id!inner(id, name, description)
        `)
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('[INVITE-FLOW] Erro na consulta:', error);
        throw new Error('Erro ao consultar convite');
      }

      if (!invites) {
        throw new Error('Convite não encontrado ou expirado');
      }

      if (!invites.email || !invites.user_roles) {
        throw new Error('Dados do convite incompletos');
      }

      const roleData = Array.isArray(invites.user_roles) ? invites.user_roles[0] : invites.user_roles;
      
      const processedData: InviteDetails = {
        id: invites.id,
        email: invites.email.toLowerCase(),
        role: {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description
        },
        expires_at: invites.expires_at,
        created_at: invites.created_at
      };

      setInviteDetails(processedData);

      console.log('[INVITE-FLOW] Detalhes carregados com sucesso:', {
        email: processedData.email,
        role: processedData.role.name
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar convite';
      console.error('[INVITE-FLOW] Erro capturado:', err);
      setError(errorMessage);
      setInviteDetails(null);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const acceptInvite = useCallback(async (): Promise<InviteFlowResult> => {
    if (!token || !user || !inviteDetails) {
      return {
        success: false,
        message: 'Dados insuficientes para aceitar convite'
      };
    }

    const userEmail = (user.email || '').toLowerCase();
    const inviteEmail = inviteDetails.email.toLowerCase();
    
    if (userEmail !== inviteEmail) {
      return {
        success: false,
        message: `Este convite foi enviado para ${inviteDetails.email}, mas você está logado como ${user.email}`
      };
    }

    try {
      setIsProcessing(true);
      console.log('[INVITE-FLOW] Aceitando convite:', { token, userId: user.id });

      const { data, error } = await supabase.rpc('accept_invite', {
        p_token: token
      });

      console.log('[INVITE-FLOW] Resposta accept_invite:', { data, error });

      if (error) {
        console.error('[INVITE-FLOW] Erro RPC accept_invite:', error);
        throw error;
      }

      if (data?.success) {
        console.log('[INVITE-FLOW] Convite aceito com sucesso');
        toast.success('Convite aceito com sucesso!');
        return {
          success: true,
          message: data.message || 'Convite aceito com sucesso!',
          requiresOnboarding: data.requires_onboarding
        };
      } else {
        console.error('[INVITE-FLOW] Falha na aceitação:', data);
        throw new Error(data?.message || 'Erro ao aceitar convite');
      }

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro ao aceitar:', error);
      const errorMessage = error.message || 'Erro ao aceitar convite';
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  }, [token, user, inviteDetails]);

  const registerWithInvite = useCallback(async (
    name: string,
    password: string
  ): Promise<InviteFlowResult> => {
    if (!token || !inviteDetails) {
      return {
        success: false,
        message: 'Dados insuficientes para registro'
      };
    }

    try {
      setIsProcessing(true);
      console.log('[INVITE-FLOW] Iniciando registro com convite:', {
        email: inviteDetails.email,
        token,
        name
      });

      // Primeiro, criar o usuário
      const { error: signUpError } = await signUp(inviteDetails.email, password, {
        inviteToken: token,
        userData: { 
          name: name || '',
          invite_token: token 
        }
      });

      if (signUpError) {
        console.error('[INVITE-FLOW] Erro no signUp:', signUpError);
        throw signUpError;
      }

      console.log('[INVITE-FLOW] Registro completado, aguardando confirmação...');
      
      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar se o usuário foi criado e está logado
      const { data: { user: newUser } } = await supabase.auth.getUser();
      
      if (!newUser) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('[INVITE-FLOW] Usuário criado:', newUser.id);

      // Agora tentar completar o registro do convite
      const { data: completeData, error: completeError } = await supabase.rpc('complete_invite_registration', {
        p_token: token,
        p_user_id: newUser.id
      });

      console.log('[INVITE-FLOW] Resultado complete_invite_registration:', { completeData, completeError });

      if (completeError) {
        console.error('[INVITE-FLOW] Erro ao completar registro:', completeError);
        // Não falhar aqui, pois o usuário já foi criado
        console.warn('[INVITE-FLOW] Continuando apesar do erro na finalização');
      }

      toast.success('Conta criada com sucesso!');
      
      return {
        success: true,
        message: 'Conta criada com sucesso!',
        requiresOnboarding: true
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro no registro:', error);
      const errorMessage = error.message || 'Erro ao criar conta';
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  }, [token, inviteDetails, signUp]);

  useEffect(() => {
    fetchInviteDetails();
  }, [fetchInviteDetails]);

  return {
    isLoading,
    inviteDetails,
    error,
    isProcessing,
    acceptInvite,
    registerWithInvite,
    refetch: fetchInviteDetails
  };
};
