
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Invite } from './types';

export function useInvitesList() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ⚡ BUSCAR CONVITES ATIVOS - Filtrar apenas convites não deletados (Soft Delete)
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query 1: Buscar apenas convites ATIVOS (não deletados) com roles
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select(`
          *,
          role:role_id(name)
        `)
        .is('deleted_at', null) // 🚀 FILTRO SOFT DELETE - Apenas convites ativos
        .order('created_at', { ascending: false });
      
      if (invitesError) throw invitesError;
      
      // Se não há convites ativos, retornar lista vazia
      if (!invitesData || invitesData.length === 0) {
        setInvites([]);
        return;
      }
      
      // Query 2: Buscar perfis dos criadores usando .in() para otimização
      const creatorIds = [...new Set(invitesData.map(invite => invite.created_by))];
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', creatorIds);
        
      if (creatorsError) {
        console.error('Erro ao buscar perfis dos criadores:', creatorsError);
      }
      
      // Criar mapa de criadores para lookup O(1)
      const creatorsMap = (creatorsData || []).reduce((acc, profile) => {
        acc[profile.id] = { name: profile.name, email: profile.email };
        return acc;
      }, {} as Record<string, { name?: string, email?: string }>);
      
      // Mapear dados finais com informações do criador
      const enrichedInvites = invitesData.map(invite => ({
        ...invite,
        creator_name: creatorsMap[invite.created_by]?.name || 'Usuário desconhecido',
        creator_email: creatorsMap[invite.created_by]?.email
      }));
      
      setInvites(enrichedInvites);
    } catch (err: any) {
      console.error('❌ Erro ao buscar convites:', err);
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
