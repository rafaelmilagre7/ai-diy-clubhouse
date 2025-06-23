
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

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

  // MELHORIA 5: Buscar detalhes com validação robusta
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

      // MELHORIA 5: Validação de token antes da consulta
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

      // MELHORIA 5: Validação de dados retornados
      if (!invites.email || !invites.user_roles) {
        throw new Error('Dados do convite incompletos');
      }

      const roleData = Array.isArray(invites.user_roles) ? invites.user_roles[0] : invites.user_roles;
      
      const processedData: InviteDetails = {
        id: invites.id,
        email: invites.email.toLowerCase(), // MELHORIA 3: Normalizar email
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
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Aceitar convite para usuário logado - SIMPLES
  const acceptInvite = useCallback(async (): Promise<InviteFlowResult> => {
    if (!token || !user || !inviteDetails) {
      return {
        success: false,
        message: 'Dados insuficientes para aceitar convite'
      };
    }

    // MELHORIA 3: Validação de email case-insensitive
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

      const { data, error } = await supabase.rpc('accept_invite', {
        p_token: token
      });

      if (error) throw error;

      if (data?.success) {
        return {
          success: true,
          message: data.message || 'Convite aceito com sucesso!',
          requiresOnboarding: data.requires_onboarding
        };
      } else {
        throw new Error(data?.message || 'Erro ao aceitar convite');
      }

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro ao aceitar:', error);
      return {
        success: false,
        message: error.message || 'Erro ao aceitar convite'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [token, user, inviteDetails]);

  // Registrar novo usuário com convite - DIRETO
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
      console.log('[INVITE-FLOW] Iniciando registro com convite');

      const { error } = await signUp(inviteDetails.email, password, {
        inviteToken: token,
        userData: { name }
      });

      if (error) {
        throw error;
      }

      console.log('[INVITE-FLOW] Registro completado com sucesso');
      
      return {
        success: true,
        message: 'Conta criada com sucesso!',
        requiresOnboarding: true
      };

    } catch (error: any) {
      console.error('[INVITE-FLOW] Erro no registro:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar conta'
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
