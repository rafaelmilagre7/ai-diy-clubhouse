
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RealtimeStats {
  activeUsers: number;
  totalUsers: number;
  implementationsToday: number;
  averageCompletionRate: number;
}

export const useRealtimeStats = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['realtime-stats'],
    queryFn: async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Buscar dados em paralelo para melhor performance
        const [profilesResponse, progressResponse, completionResponse, activeProgressResponse] = await Promise.all([
          // Total de usuários
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          
          // Implementações iniciadas hoje
          supabase
            .from('progress')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', today.toISOString()),
          
          // Implementações totais para taxa de conclusão
          supabase
            .from('progress')
            .select('is_completed'),
          
          // Usuários ativos nos últimos 7 dias
          supabase
            .from('progress')
            .select('user_id')
            .gte('last_activity', sevenDaysAgo.toISOString())
        ]);
        
        // Verificar erros
        if (profilesResponse.error) throw profilesResponse.error;
        if (progressResponse.error) throw progressResponse.error;
        if (completionResponse.error) throw completionResponse.error;
        if (activeProgressResponse.error) throw activeProgressResponse.error;

        // Calcular estatísticas
        const totalUsers = profilesResponse.count || 0;
        const implementationsToday = progressResponse.count || 0;
        
        // Calcular usuários ativos únicos
        const uniqueUserIds = new Set();
        activeProgressResponse.data?.forEach(item => uniqueUserIds.add(item.user_id));
        const activeUsers = uniqueUserIds.size;
        
        // Calcular taxa média de conclusão
        const completions = completionResponse.data || [];
        const completedCount = completions.filter(p => p.is_completed).length;
        const averageCompletionRate = completions.length > 0 
          ? Math.round((completedCount / completions.length) * 100) 
          : 0;
        
        return {
          activeUsers,
          totalUsers,
          implementationsToday,
          averageCompletionRate
        } as RealtimeStats;
      } catch (error: any) {
        console.error("Erro ao carregar estatísticas em tempo real:", error);
        toast({
          title: "Erro nas estatísticas",
          description: "Não foi possível carregar as estatísticas em tempo real.",
          variant: "destructive"
        });
        throw error; // Propagar erro para o React Query lidar
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Atualizar a cada minuto
    refetchOnWindowFocus: true,
  });
};
