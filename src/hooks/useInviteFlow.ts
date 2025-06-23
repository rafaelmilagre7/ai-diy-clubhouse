import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { InviteCache } from '@/utils/inviteCache';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { RetryManager } from '@/utils/retryUtils';

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

  // Buscar detalhes do convite
  const fetchInviteDetails = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError('');

      // Verificar cache primeiro
      const cachedData = InviteCache.get(token);
      if (cachedData) {
        console.log('[INVITE-FLOW] Usando dados do cache');
        setInviteDetails(cachedData);
        return;
      }

      console.log('[INVITE-FLOW] Buscando detalhes do convite:', token);

      const data = await RetryManager.withRetry(async () => {
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

        if (error) throw error;
        return invites;
      });

      if (!data) {
        throw new Error('Convite não encontrado ou expirado');
      }

      const roleData = Array.isArray(data.user_roles) ? data.user_roles[0] : data.user_roles;
      
      const processedData: InviteDetails = {
        id: data.id,
        email: data.email,
        role: {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description
        },
        expires_at: data.expires_at,
        created_at: data.created_at
      };

      InviteCache.set(token, processedData);
      setInviteDetails(processedData);

      console.log('[INVITE-FLOW] Detalhes carregados:', {
        email: processedData.email,
        role: processedData.role.name
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar convite';
      console.error('[INVITE-FLOW] Erro:', err);
      setError(errorMessage);
      InviteCache.clear();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Aceitar convite para usuário logado
  const acceptInvite = useCallback(async (): Promise<InviteFlowResult> => {
    if (!token || !user || !inviteDetails) {
      return {
        success: false,
        message: 'Dados insuficientes para aceitar convite'
      };
    }

    try {
      setIsProcessing(true);

      const result = await RetryManager.withRetry(async () => {
        const { data, error } = await supabase.rpc('accept_invite', {
          p_token: token
        });

        if (error) throw error;
        return data;
      });

      if (result?.success) {
        InviteCache.clear();
        InviteTokenManager.clearToken();
        
        return {
          success: true,
          message: result.message || 'Convite aceito com sucesso!',
          requiresOnboarding: result.requires_onboarding
        };
      } else {
        throw new Error(result?.message || 'Erro ao aceitar convite');
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

  // Registrar novo usuário com convite
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

      // Usar a função signUp atualizada que já processa convites
      const { error } = await signUp(inviteDetails.email, password, {
        inviteToken: token,
        userData: { name }
      });

      if (error) {
        throw error;
      }

      console.log('[INVITE-FLOW] Registro completado com sucesso');
      InviteCache.clear();
      
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
    if (token) {
      fetchInviteDetails();
    } else {
      setInviteDetails(null);
      setError('');
      InviteCache.clear();
    }
  }, [token, fetchInviteDetails]);

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
