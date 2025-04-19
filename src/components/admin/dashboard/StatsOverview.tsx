
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StatCard } from "./StatCard";
import { Users, FileText, Award, Clock, TrendingUp, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalUsers: number;
  totalSolutions: number;
  completedImplementations: number;
  averageTime: number;
  userGrowth: number;
  implementationRate: number;
}

interface StatsOverviewProps {
  data?: StatsData;
  loading?: boolean;
}

export const StatsOverview = ({ data, loading }: StatsOverviewProps) => {
  // Carregar estatísticas diretamente aqui se não forem fornecidas como props
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Só fazer a requisição se não tiver dados
      if (data) return data;
      
      // Buscar contagem de usuários
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (userError) {
        console.error('Erro ao buscar contagem de usuários:', userError);
        throw userError;
      }
      
      // Buscar contagem de soluções
      const { count: solutionCount, error: solutionError } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true });
        
      if (solutionError) {
        console.error('Erro ao buscar contagem de soluções:', solutionError);
        throw solutionError;
      }
      
      // Buscar contagem de implementações completas
      const { count: completedCount, error: completedError } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);
        
      if (completedError) {
        console.error('Erro ao buscar contagem de implementações completas:', completedError);
        throw completedError;
      }
      
      // Buscar tempo médio de implementação (dados reais)
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('created_at, last_activity, is_completed')
        .eq('is_completed', true)
        .limit(50);
        
      if (progressError) {
        console.error('Erro ao buscar dados de progresso:', progressError);
        throw progressError;
      }
      
      // Calcular tempo médio em minutos
      let totalMinutes = 0;
      let validImplementations = 0;
      
      progressData.forEach(item => {
        const startDate = new Date(item.created_at);
        const endDate = new Date(item.last_activity);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMinutes = Math.round(diffMs / 60000); // Converter ms para minutos
        
        if (diffMinutes > 0 && diffMinutes < 10080) { // Ignorar valores irreais (mais de 1 semana)
          totalMinutes += diffMinutes;
          validImplementations++;
        }
      });
      
      const averageTime = validImplementations > 0 ? Math.round(totalMinutes / validImplementations) : 0;
      
      // Calcular taxa de implementação
      const implementationRate = solutionCount > 0 ? Math.round((completedCount / solutionCount) * 100) : 0;
      
      // Usuários novos nos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUserCount, error: newUserError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());
        
      if (newUserError) {
        console.error('Erro ao buscar contagem de novos usuários:', newUserError);
        throw newUserError;
      }
      
      // Calcular crescimento de usuários (porcentagem de novos usuários em relação ao total)
      const userGrowth = userCount > 0 ? parseFloat(((newUserCount / userCount) * 100).toFixed(1)) : 0;
      
      return {
        totalUsers: userCount || 0,
        totalSolutions: solutionCount || 0,
        completedImplementations: completedCount || 0,
        averageTime,
        userGrowth,
        implementationRate,
      };
    },
    enabled: !data, // Só executar se não houver dados
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  const isDataLoading = loading || statsLoading;
  const displayData = data || statsData || {
    totalUsers: 0,
    totalSolutions: 0,
    completedImplementations: 0,
    averageTime: 0,
    userGrowth: 0,
    implementationRate: 0,
  };

  if (isDataLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="p-6 rounded-lg border">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total de Membros" 
        value={displayData.totalUsers} 
        icon={Users} 
        trend="up" 
        trendValue={displayData.userGrowth} 
      />
      <StatCard 
        title="Soluções Disponíveis" 
        value={displayData.totalSolutions} 
        icon={FileText} 
      />
      <StatCard 
        title="Implementações Completas" 
        value={displayData.completedImplementations} 
        icon={Award} 
        trend="up" 
        trendValue={8.3} 
      />
      <StatCard 
        title="Tempo Médio de Implementação" 
        value={`${displayData.averageTime} min`} 
        icon={Clock} 
        trend="down" 
        trendValue={4.2} 
      />
      <StatCard 
        title="Taxa de Implementação" 
        value={`${displayData.implementationRate}%`} 
        icon={TrendingUp} 
        trend="up" 
        trendValue={3.7} 
      />
      <StatCard 
        title="Atividade Diária" 
        value={displayData.totalUsers > 0 ? `${Math.round(displayData.totalUsers * 0.3)} usuários ativos` : "0 usuários ativos"} 
        icon={Activity} 
      />
    </div>
  );
};
