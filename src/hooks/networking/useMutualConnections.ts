import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface MutualConnection {
  id: string;
  name: string;
  avatar_url?: string;
}

export const useMutualConnections = (targetUserId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mutual-connections', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) {
        return { count: 0, profiles: [] };
      }

      // Buscar conexões do usuário atual
      const { data: myConnections } = await supabase
        .from('member_connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const myConnectionIds = myConnections?.map(c => 
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      ) || [];

      if (myConnectionIds.length === 0) {
        return { count: 0, profiles: [] };
      }

      // Buscar conexões do usuário alvo
      const { data: targetConnections } = await supabase
        .from('member_connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${targetUserId},recipient_id.eq.${targetUserId}`);

      const targetConnectionIds = targetConnections?.map(c => 
        c.requester_id === targetUserId ? c.recipient_id : c.requester_id
      ) || [];

      // Interseção entre as duas listas
      const mutualIds = myConnectionIds.filter(id => targetConnectionIds.includes(id));

      if (mutualIds.length === 0) {
        return { count: 0, profiles: [] };
      }

      // Buscar perfis das conexões mútuas (máximo 5 para mostrar)
      const { data: mutualProfiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', mutualIds)
        .limit(5);

      return {
        count: mutualIds.length,
        profiles: (mutualProfiles || []) as MutualConnection[]
      };
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
