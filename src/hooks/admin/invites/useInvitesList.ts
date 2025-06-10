
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';

export function useInvitesList() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Buscar todos os convites com uma única query otimizada usando JOINs
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query otimizada com JOINs para buscar todos os dados necessários de uma vez
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select(`
          *,
          role:role_id(name),
          creator_profile:created_by(name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (invitesError) throw invitesError;
      
      // Transformar os dados para manter compatibilidade com a interface existente
      const enrichedInvites = (invitesData || []).map(invite => ({
        ...invite,
        creator_name: invite.creator_profile?.name || 'Usuário desconhecido',
        creator_email: invite.creator_profile?.email
      }));
      
      setInvites(enrichedInvites);
    } catch (err: any) {
      console.error('Erro ao buscar convites:', err);
      setError(err);
      toast.error('Erro ao carregar convites', {
        description: err.message || 'Não foi possível carregar a lista de convites.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    invites,
    loading,
    error,
    fetchInvites
  };
}
