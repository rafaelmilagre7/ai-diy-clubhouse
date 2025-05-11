
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';

export function useInvitesList() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Buscar todos os convites
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Consulta modificada para evitar o join direto com auth.users
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select(`
          *,
          role:role_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (invitesError) throw invitesError;
      
      // Obter IDs dos criadores para buscar seus perfis separadamente
      const creatorIds = invitesData?.map(invite => invite.created_by) || [];
      
      // Buscar dados dos criadores da tabela de perfis
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', creatorIds);
        
      if (creatorsError) {
        console.error('Erro ao buscar perfis dos criadores:', creatorsError);
      }
      
      // Mapa de ID para dados do criador
      const creatorsMap = (creatorsData || []).reduce((acc, profile) => {
        acc[profile.id] = { name: profile.name, email: profile.email };
        return acc;
      }, {} as Record<string, { name?: string, email?: string }>);
      
      // Combinar dados de convites com dados de criadores
      const enrichedInvites = (invitesData || []).map(invite => ({
        ...invite,
        creator_name: creatorsMap[invite.created_by]?.name || 'Usuário desconhecido',
        creator_email: creatorsMap[invite.created_by]?.email
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
