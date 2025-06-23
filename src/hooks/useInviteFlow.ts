
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface InviteDetails {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  expires_at: string;
  used_at: string | null;
}

export interface InviteFlowResult {
  success: boolean;
  message: string;
  requiresOnboarding?: boolean;
}

export const useInviteFlow = (inviteToken?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Buscar detalhes do convite
  const fetchInviteDetails = useCallback(async (token: string) => {
    try {
      console.log('[INVITE-FLOW] Buscando detalhes do convite:', token);
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          expires_at,
          used_at,
          role:user_roles(id, name, description)
        `)
        .eq('token', token.toUpperCase())
        .maybeSingle();

      if (fetchError) {
        console.error('[INVITE-FLOW] Erro ao buscar convite:', fetchError);
        throw new Error('Erro ao verificar convite');
      }

      if (!data) {
        console.log('[INVITE-FLOW] Convite não encontrado');
        throw new Error('Convite não encontrado');
      }

      // Verificar se já foi usado
      if (data.used_at) {
        console.log('[INVITE-FLOW] Convite já utilizado');
        throw new Error('Este convite já foi utilizado');
      }

      // Verificar se expirou
      if (new Date(data.expires_at) < new Date()) {
        console.log('[INVITE-FLOW] Convite expirado');
        throw new Error('Este convite expirou');
      }

      // Verificar se role é um array e pegar o primeiro item
      let roleData;
      if (Array.isArray(data.role) && data.role.length > 0) {
        roleData = data.role[0];
      } else if (data.role && !Array.isArray(data.role)) {
        roleData = data.role;
      } else {
        throw new Error('Dados do convite incompletos');
      }

      const inviteData: InviteDetails = {
        id: data.id,
        email: data.email,
        role: {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description
        },
        expires_at: data.expires_at,
        used_at: data.used_at
      };

      console.log('[INVITE-FLOW] Convite válido encontrado:', {
        email: inviteData.email,
        role: inviteData.role.name
      });

      setInviteDetails(inviteData);
      return inviteData;

    } catch (err: any) {
      console.error('[INVITE-FLOW] Erro ao buscar convite:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aceitar convite para usuário logado
  const acceptInvite = useCallback(async (): Promise<InviteFlowResult> => {
    if (!inviteToken || !inviteDetails) {
      return {
        success: false,
        message: 'Dados do convite não encontrados'
      };
    }

    try {
      console.log('[INVITE-FLOW] Aceitando convite para usuário logado');
      setIsProcessing(true);

      const { data, error: acceptError } = await supabase.rpc('use_invite', {
        invite_token: inviteToken,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (acceptError) {
        console.error('[INVITE-FLOW] Erro ao aceitar convite:', acceptError);
        throw new Error('Erro ao aceitar convite');
      }

      if (data?.status !== 'success') {
        throw new Error(data?.message || 'Erro ao aceitar convite');
      }

      // Log de segurança
      try {
        await supabase
          .from('audit_logs')
          .insert({
            event_type: 'invite_accepted',
            action: 'accept_invite',
            resource_id: inviteDetails.id,
            details: {
              invite_email: inviteDetails.email,
              role_name: inviteDetails.role.name
            }
          });
      } catch (logError) {
        console.warn('[INVITE-FLOW] Erro ao registrar log de auditoria:', logError);
        // Não falhar por causa do log
      }

      console.log('[INVITE-FLOW] Convite aceito com sucesso');
      
      return {
        success: true,
        message: 'Convite aceito com sucesso!',
        requiresOnboarding: true // Usuários com convite sempre precisam de onboarding
      };

    } catch (err: any) {
      console.error('[INVITE-FLOW] Erro ao aceitar convite:', err);
      return {
        success: false,
        message: err.message || 'Erro ao aceitar convite'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [inviteToken, inviteDetails]);

  // Registrar novo usuário com convite
  const registerWithInvite = useCallback(async (
    name: string, 
    password: string
  ): Promise<InviteFlowResult> => {
    if (!inviteToken || !inviteDetails) {
      return {
        success: false,
        message: 'Dados do convite não encontrados'
      };
    }

    try {
      console.log('[INVITE-FLOW] Registrando novo usuário com convite');
      setIsProcessing(true);

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteDetails.email,
        password: password,
        options: {
          data: {
            name: name,
            from_invite: true,
            invite_token: inviteToken
          }
        }
      });

      if (authError) {
        console.error('[INVITE-FLOW] Erro ao criar conta:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta de usuário');
      }

      // 2. Aguardar um pouco para o trigger do perfil ser executado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Usar o convite
      const { data: inviteData, error: inviteError } = await supabase.rpc('use_invite', {
        invite_token: inviteToken,
        user_id: authData.user.id
      });

      if (inviteError || inviteData?.status !== 'success') {
        console.error('[INVITE-FLOW] Erro ao usar convite:', inviteError || inviteData);
        throw new Error(inviteData?.message || 'Erro ao aplicar convite');
      }

      // Log de segurança
      try {
        await supabase
          .from('audit_logs')
          .insert({
            event_type: 'user_registered_with_invite',
            action: 'register_with_invite',
            resource_id: inviteDetails.id,
            details: {
              user_id: authData.user.id,
              invite_email: inviteDetails.email,
              role_name: inviteDetails.role.name
            }
          });
      } catch (logError) {
        console.warn('[INVITE-FLOW] Erro ao registrar log de auditoria:', logError);
        // Não falhar por causa do log
      }

      console.log('[INVITE-FLOW] Usuário registrado e convite aplicado com sucesso');
      
      return {
        success: true,
        message: 'Conta criada com sucesso!',
        requiresOnboarding: true // Novos usuários sempre precisam de onboarding
      };

    } catch (err: any) {
      console.error('[INVITE-FLOW] Erro ao registrar usuário:', err);
      return {
        success: false,
        message: err.message || 'Erro ao criar conta'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [inviteToken, inviteDetails]);

  // Efeito para buscar detalhes quando o token muda
  useEffect(() => {
    if (inviteToken) {
      fetchInviteDetails(inviteToken).catch(err => {
        console.error('[INVITE-FLOW] Erro no efeito de busca:', err);
      });
    }
  }, [inviteToken, fetchInviteDetails]);

  return {
    isLoading,
    inviteDetails,
    error,
    isProcessing,
    acceptInvite,
    registerWithInvite,
    refetch: () => inviteToken ? fetchInviteDetails(inviteToken) : Promise.resolve()
  };
};
