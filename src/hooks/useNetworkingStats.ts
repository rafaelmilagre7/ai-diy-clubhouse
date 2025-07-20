import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNetworkingStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['networking-stats'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { matches: 0, connections: 0, notifications: 0 };

      // Buscar quantidade de matches pendentes (mesma condição do grid)
      const { count: matchesCount } = await supabase
        .from('network_matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('status', 'pending');

      // Buscar quantidade de conexões
      const { count: connectionsCount } = await supabase
        .from('member_connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
        .eq('status', 'accepted');

      // Buscar quantidade de notificações não lidas
      const { count: notificationsCount } = await supabase
        .from('connection_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);

      return {
        matches: matchesCount || 0,
        connections: connectionsCount || 0,
        notifications: notificationsCount || 0
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 0, // Sempre buscar dados atualizados
  });

  return {
    data: stats || { matches: 0, connections: 0, notifications: 0 },
    isLoading
  };
};