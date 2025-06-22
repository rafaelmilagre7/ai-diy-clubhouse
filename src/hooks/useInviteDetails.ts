
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

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
  created_by?: string;
}

export const useInviteDetails = (token?: string) => {
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[USE-INVITE-DETAILS] Hook inicializado com token:', token);
    
    if (!token) {
      console.log('[USE-INVITE-DETAILS] Nenhum token fornecido');
      setLoading(false);
      setError('Token de convite não fornecido');
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[USE-INVITE-DETAILS] Buscando convite com token:', token);

        // Primeiro, tentar usar a função melhorada de validação
        const { data: enhancedResult, error: enhancedError } = await supabase
          .rpc('validate_invite_token_enhanced', { p_token: token });

        console.log('[USE-INVITE-DETAILS] Resultado da função enhanced:', { enhancedResult, error: enhancedError });

        let invite = null;

        if (!enhancedError && enhancedResult && enhancedResult.length > 0) {
          invite = enhancedResult[0];
        } else {
          // Fallback para busca direta
          console.log('[USE-INVITE-DETAILS] Fallback para busca direta');
          const { data: fallbackResult, error: fallbackError } = await supabase
            .from('invites')
            .select(`
              id,
              email,
              token,
              expires_at,
              created_by,
              role_id,
              used_at
            `)
            .or(`token.eq.${token},token.ilike.${token.substring(0, 8)}%`)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .limit(1)
            .single();

          if (fallbackError) {
            console.error('[USE-INVITE-DETAILS] Erro na busca fallback:', fallbackError);
          } else {
            invite = fallbackResult;
          }
        }

        if (!invite) {
          console.error('[USE-INVITE-DETAILS] Convite não encontrado');
          setError('Convite não encontrado, expirado ou já utilizado');
          
          // Log da tentativa de validação
          try {
            await supabase.rpc('log_invite_validation_attempt', {
              p_token: token,
              p_success: false,
              p_error_message: 'Convite não encontrado'
            });
          } catch (logError) {
            console.warn('[USE-INVITE-DETAILS] Erro ao registrar tentativa:', logError);
          }
          
          return;
        }

        // Buscar informações do role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id, name, description')
          .eq('id', invite.role_id)
          .single();

        if (roleError || !roleData) {
          console.error('[USE-INVITE-DETAILS] Erro ao buscar role:', roleError);
          setError('Dados do cargo não encontrados');
          return;
        }

        // Montar detalhes do convite
        const details: InviteDetails = {
          id: invite.id,
          email: invite.email,
          token: invite.token,
          expires_at: invite.expires_at,
          created_by: invite.created_by,
          role: {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description
          }
        };

        console.log('[USE-INVITE-DETAILS] Convite válido encontrado:', details);
        setInviteDetails(details);
        
        // Log da tentativa de validação bem-sucedida
        try {
          await supabase.rpc('log_invite_validation_attempt', {
            p_token: token,
            p_success: true
          });
        } catch (logError) {
          console.warn('[USE-INVITE-DETAILS] Erro ao registrar tentativa bem-sucedida:', logError);
        }
        
        logger.info('Detalhes do convite carregados com sucesso', { 
          component: 'useInviteDetails',
          email: details.email, 
          role: details.role.name 
        });

      } catch (error: any) {
        console.error('[USE-INVITE-DETAILS] Erro inesperado:', error);
        logger.error('Erro ao carregar detalhes do convite', error, {
          component: 'useInviteDetails'
        });
        setError(`Erro inesperado: ${error.message}`);
        
        // Log da tentativa de validação com erro
        try {
          await supabase.rpc('log_invite_validation_attempt', {
            p_token: token,
            p_success: false,
            p_error_message: error.message
          });
        } catch (logError) {
          console.warn('[USE-INVITE-DETAILS] Erro ao registrar tentativa com erro:', logError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  return {
    inviteDetails,
    loading,
    error
  };
};
