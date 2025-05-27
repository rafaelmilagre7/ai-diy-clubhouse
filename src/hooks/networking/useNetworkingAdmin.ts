
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useGenerateMatches() {
  return useMutation({
    mutationFn: async ({ 
      targetUserId, 
      forceRegenerate = false 
    }: { 
      targetUserId?: string; 
      forceRegenerate?: boolean; 
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-networking-matches', {
        body: {
          target_user_id: targetUserId,
          force_regenerate: forceRegenerate
        }
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Matches gerados com sucesso! ${data.total_matches_generated} matches criados.`
      );
    },
    onError: (error) => {
      console.error('Erro ao gerar matches:', error);
      toast.error('Erro ao gerar matches. Tente novamente.');
    }
  });
}

export function useNetworkingStats() {
  return useQuery({
    queryKey: ['networking-stats'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Buscar estatísticas de matches do mês atual
      const { data: matchStats, error: matchError } = await supabase
        .from('network_matches')
        .select('status, match_type')
        .eq('month_year', currentMonth);

      if (matchError) {
        throw matchError;
      }

      // Buscar estatísticas de conexões
      const { data: connectionStats, error: connectionError } = await supabase
        .from('network_connections')
        .select('status')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (connectionError) {
        throw connectionError;
      }

      // Buscar total de usuários ativos
      const { count: activeUsers, error: usersError } = await supabase
        .from('onboarding_profile_view')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .in('role', ['admin', 'formacao']);

      if (usersError) {
        throw usersError;
      }

      // Processar estatísticas
      const totalMatches = matchStats.length;
      const pendingMatches = matchStats.filter(m => m.status === 'pending').length;
      const viewedMatches = matchStats.filter(m => m.status === 'viewed').length;
      const contactedMatches = matchStats.filter(m => m.status === 'contacted').length;
      
      const customerMatches = matchStats.filter(m => m.match_type === 'customer').length;
      const supplierMatches = matchStats.filter(m => m.match_type === 'supplier').length;

      const pendingConnections = connectionStats.filter(c => c.status === 'pending').length;
      const acceptedConnections = connectionStats.filter(c => c.status === 'accepted').length;

      return {
        currentMonth,
        activeUsers: activeUsers || 0,
        matches: {
          total: totalMatches,
          pending: pendingMatches,
          viewed: viewedMatches,
          contacted: contactedMatches,
          byType: {
            customer: customerMatches,
            supplier: supplierMatches
          }
        },
        connections: {
          pending: pendingConnections,
          accepted: acceptedConnections,
          total: connectionStats.length
        },
        conversionRate: totalMatches > 0 ? Math.round((contactedMatches / totalMatches) * 100) : 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
