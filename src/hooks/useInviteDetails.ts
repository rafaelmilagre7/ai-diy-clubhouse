
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

        // Busca direta e simplificada do convite
        const { data: inviteData, error: inviteError } = await supabase
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
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        console.log('[USE-INVITE-DETAILS] Resultado da busca do convite:', { inviteData, error: inviteError });

        if (inviteError || !inviteData) {
          console.error('[USE-INVITE-DETAILS] Convite não encontrado:', inviteError);
          setError('Convite não encontrado, expirado ou já utilizado');
          return;
        }

        // Buscar informações do role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id, name, description')
          .eq('id', inviteData.role_id)
          .single();

        console.log('[USE-INVITE-DETAILS] Resultado da busca do role:', { roleData, error: roleError });

        if (roleError || !roleData) {
          console.error('[USE-INVITE-DETAILS] Erro ao buscar role:', roleError);
          setError('Dados do cargo não encontrados');
          return;
        }

        // Montar detalhes do convite
        const details: InviteDetails = {
          id: inviteData.id,
          email: inviteData.email,
          token: inviteData.token,
          expires_at: inviteData.expires_at,
          created_by: inviteData.created_by,
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
