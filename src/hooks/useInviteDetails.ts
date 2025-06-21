
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

        // Buscar detalhes do convite com join na tabela de roles
        const { data: invite, error: inviteError } = await supabase
          .from('invites')
          .select(`
            id,
            email,
            token,
            expires_at,
            created_by,
            role_id,
            used_at,
            user_roles:role_id (
              id,
              name,
              description
            )
          `)
          .eq('token', token)
          .single();

        console.log('[USE-INVITE-DETAILS] Resultado da busca:', { invite, error: inviteError });

        if (inviteError) {
          console.error('[USE-INVITE-DETAILS] Erro ao buscar convite:', inviteError);
          
          if (inviteError.code === 'PGRST116') {
            setError('Convite não encontrado. Verifique se o link está correto.');
          } else {
            setError(`Erro ao buscar convite: ${inviteError.message}`);
          }
          return;
        }

        if (!invite) {
          console.error('[USE-INVITE-DETAILS] Convite não encontrado');
          setError('Convite não encontrado');
          return;
        }

        // Verificar se o convite já foi usado
        if (invite.used_at) {
          console.error('[USE-INVITE-DETAILS] Convite já foi usado:', invite.used_at);
          setError('Este convite já foi utilizado');
          return;
        }

        // Verificar se o convite não expirou
        const now = new Date();
        const expiresAt = new Date(invite.expires_at);
        
        console.log('[USE-INVITE-DETAILS] Verificando expiração:', {
          now: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          expired: expiresAt < now
        });
        
        if (expiresAt < now) {
          setError('Este convite expirou');
          return;
        }

        // Verificar se temos dados do role
        const roleData = Array.isArray(invite.user_roles) 
          ? invite.user_roles[0] 
          : invite.user_roles;

        if (!roleData) {
          console.error('[USE-INVITE-DETAILS] Dados do role não encontrados');
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
