
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
        // Buscar dados em paralelo para melhor performance
        const [profilesResponse, progressResponse, completionResponse] = await Promise.all([
          // Total de usuários
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          
          // Implementações hoje
          supabase.from('progress')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
          
          // Taxa de conclusão média
          supabase.from('progress')
            .select('is_completed')
        ]);
        
        // Verificar erros
        if (profilesResponse.error) throw profilesResponse.error;
        if (progressResponse.error) throw progressResponse.error;
        if (completionResponse.error) throw completionResponse.error;

        // Calcular estatísticas
        const totalUsers = profilesResponse.count || 0;
        const implementationsToday = progressResponse.count || 0;
        
        // Calcular usuários ativos (com alguma atividade nos últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: activeUsersCount, error: activeError } = await supabase
          .from('progress')
          .select('user_id', { count: 'exact', head: true, distinct: true })
          .gte('last_activity', sevenDaysAgo.toISOString());
          
        if (activeError) throw activeError;
        
        // Calcular taxa média de conclusão
        const completions = completionResponse.data || [];
        const completedCount = completions.filter(p => p.is_completed).length;
        const averageCompletionRate = completions.length > 0 
          ? Math.round((completedCount / completions.length) * 100) 
          : 0;
        
        return {
          activeUsers: activeUsersCount || 0,
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
        return {
          activeUsers: 0,
          totalUsers: 0,
          implementationsToday: 0,
          averageCompletionRate: 0
        };
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Atualizar a cada minuto
    refetchOnWindowFocus: true,
  });
};
