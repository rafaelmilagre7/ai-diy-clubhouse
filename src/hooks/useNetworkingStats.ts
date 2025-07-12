import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useNetworkingStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['networking-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { matches: 0, connections: 0, goals: 0, notifications: 0 };

      // Buscar matches pendentes
      const { count: matchesCount } = await supabase
        .from('network_matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Buscar conexões aceitas
      const { count: connectionsCount } = await supabase
        .from('member_connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Buscar notificações não lidas
      const { count: notificationsCount } = await supabase
        .from('connection_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      return {
        matches: matchesCount || 0,
        connections: connectionsCount || 0,
        goals: 2, // Mock por enquanto
        notifications: notificationsCount || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};