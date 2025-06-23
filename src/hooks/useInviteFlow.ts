
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

export const useInviteFlow = (token?: string) => {
  const navigate = useNavigate();
  const { user, setProfile } = useAuth();
  
  const [state, setState] = useState<InviteFlowState>({
    isLoading: !!token,
    inviteDetails: null,
    error: null,
    isProcessing: false
  });

  // Carregar detalhes do convite
  useEffect(() => {
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Token não fornecido' }));
      return;
    }

    const loadInviteDetails = async () => {
      try {
        console.log('[INVITE-FLOW] Carregando detalhes do convite:', token.substring(0, 8) + '...');

        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select(`
            id,
            email,
            token,
            expires_at,
            role_id,
            used_at
          `)
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (inviteError || !inviteData) {
          throw new Error('Convite não encontrado, expirado ou já utilizado');
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id, name, description')
          .eq('id', inviteData.role_id)
          .single();

        if (roleError || !roleData) {
          throw new Error('Dados do cargo não encontrados');
        }

        const details: InviteDetails = {
          id: inviteData.id,
          email: inviteData.email,
          token: inviteData.token,
          expires_at: inviteData.expires_at,
          role: {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description
          }
        };

        setState(prev => ({
          ...prev,
          isLoading: false,
          inviteDetails: details,
          error: null
        }));

        console.log('[INVITE-FLOW] Convite carregado com sucesso:', {
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

  // Aceitar convite (para usuários já logados)
  const acceptInvite = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!token || !user?.id) {
      return {
        success: false,
        message: 'Token ou usuário não encontrado'
      };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('[INVITE-FLOW] Aceitando convite para usuário logado:', user.email);

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

      // Recarregar perfil
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
          email: profileData.email || user.email || '',
        } as any);
      }

      setState(prev => ({ ...prev, isProcessing: false }));
      
      return {
        success: true,
        message: 'Convite aceito com sucesso!'
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro ao aceitar convite:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
      
      return {
        success: false,
        message: error.message || 'Erro ao processar convite'
      };
    }
  }, [token, user, setProfile]);

  // Registrar novo usuário com convite
  const registerWithInvite = useCallback(async (
    name: string, 
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!token || !state.inviteDetails) {
      return {
        success: false,
        message: 'Dados do convite não encontrados'
      };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('[INVITE-FLOW] Registrando novo usuário:', state.inviteDetails.email);

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

      // Usar convite
      const { error: inviteError } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: authData.user.id
      });

      if (inviteError) {
        console.warn('[INVITE-FLOW] Erro ao usar convite, mas usuário foi criado:', inviteError);
      }

      setState(prev => ({ ...prev, isProcessing: false }));

      return {
        success: true,
        message: 'Conta criada com sucesso! Bem-vindo à plataforma.'
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
    registerWithInvite
  };
};
