
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface InviteDetails {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
  token: string;
  expires_at: string;
}

interface InviteFlowState {
  isLoading: boolean;
  inviteDetails: InviteDetails | null;
  error: string | null;
  isProcessing: boolean;
}

interface InviteFlowResult {
  success: boolean;
  message: string;
  requiresOnboarding?: boolean;
}

export const useInviteFlow = (token?: string) => {
  const { user, setProfile } = useAuth();
  
  const [state, setState] = useState<InviteFlowState>({
    isLoading: !!token,
    inviteDetails: null,
    error: null,
    isProcessing: false
  });

  // Carregar e validar convite
  useEffect(() => {
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Token não fornecido' }));
      return;
    }

    const loadInviteDetails = async () => {
      try {
        console.log('[INVITE-FLOW] Carregando convite:', token.substring(0, 8) + '...');

        // Query otimizada - buscar convite e role em uma única operação
        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select(`
            id,
            email,
            token,
            expires_at,
            role_id,
            used_at,
            user_roles!inner (
              id,
              name,
              description
            )
          `)
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (inviteError || !inviteData) {
          const errorMsg = inviteError?.code === 'PGRST116' 
            ? 'Convite não encontrado, expirado ou já utilizado'
            : 'Erro ao carregar convite';
          throw new Error(errorMsg);
        }

        const details: InviteDetails = {
          id: inviteData.id,
          email: inviteData.email,
          token: inviteData.token,
          expires_at: inviteData.expires_at,
          role: {
            id: inviteData.user_roles.id,
            name: inviteData.user_roles.name,
            description: inviteData.user_roles.description
          }
        };

        setState(prev => ({
          ...prev,
          isLoading: false,
          inviteDetails: details,
          error: null
        }));

        console.log('[INVITE-FLOW] Convite válido carregado:', {
          email: details.email,
          role: details.role.name
        });

      } catch (error: any) {
        console.error('[INVITE-FLOW] Erro ao carregar convite:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    loadInviteDetails();
  }, [token]);

  // Validar se o usuário logado pode aceitar este convite
  const validateUserForInvite = useCallback((userEmail: string, inviteEmail: string): boolean => {
    const normalizeEmail = (email: string) => email.toLowerCase().trim();
    return normalizeEmail(userEmail) === normalizeEmail(inviteEmail);
  }, []);

  // Aceitar convite (para usuários já logados)
  const acceptInvite = useCallback(async (): Promise<InviteFlowResult> => {
    if (!token || !user?.id || !state.inviteDetails) {
      return {
        success: false,
        message: 'Dados insuficientes para aceitar convite'
      };
    }

    // Validação de segurança - email deve corresponder
    const userEmail = user.email || '';
    if (!validateUserForInvite(userEmail, state.inviteDetails.email)) {
      return {
        success: false,
        message: 'Este convite foi enviado para outro email. Faça login com a conta correta ou solicite um novo convite.'
      };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('[INVITE-FLOW] Aceitando convite para usuário:', userEmail);

      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: user.id
      });

      if (error) {
        throw error;
      }

      if (!data || (typeof data === 'object' && data.status === 'error')) {
        throw new Error('Convite não encontrado ou já utilizado');
      }

      // Recarregar perfil atualizado
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          ...profileData as any,
          email: profileData.email || userEmail,
        } as any);
      }

      // Log de auditoria para segurança
      await supabase.rpc('log_security_access', {
        p_table_name: 'invites',
        p_operation: 'accept_invite',
        p_resource_id: state.inviteDetails.id
      }).catch(() => {}); // Falhar silenciosamente

      setState(prev => ({ ...prev, isProcessing: false }));
      
      // Verificar se precisa de onboarding
      const needsOnboarding = !user.user_metadata?.onboarding_completed;
      
      return {
        success: true,
        message: 'Convite aceito com sucesso!',
        requiresOnboarding: needsOnboarding
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro ao aceitar convite:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
      
      return {
        success: false,
        message: error.message || 'Erro ao processar convite'
      };
    }
  }, [token, user, state.inviteDetails, setProfile, validateUserForInvite]);

  // Registrar novo usuário com convite
  const registerWithInvite = useCallback(async (
    name: string, 
    password: string
  ): Promise<InviteFlowResult> => {
    if (!token || !state.inviteDetails) {
      return {
        success: false,
        message: 'Dados do convite não encontrados'
      };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('[INVITE-FLOW] Registrando usuário:', state.inviteDetails.email);

      // Criar conta do usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: state.inviteDetails.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            invite_token: token
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Usar convite automaticamente
      const { error: inviteError } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: authData.user.id
      });

      if (inviteError) {
        console.warn('[INVITE-FLOW] Erro ao usar convite após registro:', inviteError);
      }

      // Log de auditoria
      await supabase.rpc('log_security_access', {
        p_table_name: 'invites',
        p_operation: 'register_with_invite',
        p_resource_id: state.inviteDetails.id
      }).catch(() => {});

      setState(prev => ({ ...prev, isProcessing: false }));

      return {
        success: true,
        message: 'Conta criada com sucesso! Bem-vindo à plataforma.',
        requiresOnboarding: true
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro no registro:', error);
      setState(prev => ({ ...prev, isProcessing: false }));

      let message = 'Erro ao criar conta';
      if (error.message?.includes('User already registered')) {
        message = 'Este email já possui uma conta. Faça login para aceitar o convite.';
      } else if (error.message?.includes('Invalid login credentials')) {
        message = 'Email ou senha inválidos';
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  }, [token, state.inviteDetails]);

  return {
    ...state,
    acceptInvite,
    registerWithInvite,
    validateUserForInvite
  };
};
