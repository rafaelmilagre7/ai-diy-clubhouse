
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
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar detalhes do convite
        const { data: invite, error: inviteError } = await supabase
          .from('invites')
          .select(`
            id,
            email,
            token,
            expires_at,
            created_by,
            role_id,
            user_roles:role_id (
              id,
              name,
              description
            )
          `)
          .eq('token', token)
          .eq('used_at', null)
          .single();

        if (inviteError || !invite) {
          logger.error('Erro ao buscar convite:', inviteError);
          setError('Convite não encontrado ou inválido');
          return;
        }

        // Verificar se o convite não expirou
        const now = new Date();
        const expiresAt = new Date(invite.expires_at);
        
        if (expiresAt < now) {
          setError('Este convite expirou');
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
            id: invite.user_roles?.id || '',
            name: invite.user_roles?.name || 'member',
            description: invite.user_roles?.description
          }
        };

        setInviteDetails(details);
        logger.info('Detalhes do convite carregados', { 
          component: 'useInviteDetails',
          email: details.email, 
          role: details.role.name 
        });

      } catch (error: any) {
        logger.error('Erro ao carregar detalhes do convite', error, {
          component: 'useInviteDetails'
        });
        setError('Erro ao carregar detalhes do convite');
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
