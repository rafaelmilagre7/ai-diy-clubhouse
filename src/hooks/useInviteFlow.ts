
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';

interface InviteDetails {
  token: string;
  email: string;
  role: UserRole;
  created_at: string;
  expires_at: string;
  is_used: boolean;
}

interface UseInviteFlowResult {
  inviteDetails: InviteDetails | null;
  isLoading: boolean;
  error: string | null;
}

export const useInviteFlow = (inviteToken?: string): UseInviteFlowResult => {
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CORREÇÃO CRÍTICA: Não executar se não há token válido
    if (!inviteToken || inviteToken.trim() === '') {
      logger.info('[INVITE-FLOW] Sem token de convite - não executando requisições');
      setInviteDetails(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchInviteDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        logger.info('[INVITE-FLOW] Buscando detalhes do convite:', { token: inviteToken.substring(0, 8) + '***' });

        const { data, error: fetchError } = await supabase
          .from('invites')
          .select(`
            token,
            email,
            role:user_roles(id, name),
            created_at,
            expires_at,
            is_used
          `)
          .eq('token', inviteToken)
          .maybeSingle();

        if (fetchError) {
          logger.error('[INVITE-FLOW] Erro ao buscar convite:', fetchError);
          setError('Erro ao validar convite');
          return;
        }

        if (!data) {
          logger.warn('[INVITE-FLOW] Convite não encontrado');
          setError('Convite não encontrado ou inválido');
          return;
        }

        // Verificar se o convite não expirou
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (now > expiresAt) {
          logger.warn('[INVITE-FLOW] Convite expirado');
          setError('Convite expirado');
          return;
        }

        // Verificar se já foi usado
        if (data.is_used) {
          logger.warn('[INVITE-FLOW] Convite já foi usado');
          setError('Convite já foi utilizado');
          return;
        }

        logger.info('[INVITE-FLOW] Convite válido encontrado');
        setInviteDetails(data as InviteDetails);

      } catch (err) {
        logger.error('[INVITE-FLOW] Erro inesperado:', err);
        setError('Erro ao processar convite');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteDetails();
  }, [inviteToken]);

  return {
    inviteDetails,
    isLoading,
    error
  };
};
