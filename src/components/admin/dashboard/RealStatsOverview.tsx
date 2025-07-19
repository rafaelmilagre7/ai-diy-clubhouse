
import { StatCard } from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, GraduationCap, CheckCircle, Clock, TrendingUp, Activity, Target, UserPlus, Zap } from "lucide-react";

interface RealStatsOverviewProps {
  data: {
    // Dados cumulativos
    totalUsers: number;
    totalSolutions: number;
    totalLearningLessons: number;
    completedImplementations: number;
    averageImplementationTime: number;
    usersByRole: { role: string; count: number }[];
    
    // Dados específicos do período
    newUsersInPeriod: number;
    activeUsersInPeriod: number;
    implementationsInPeriod: number;
    completedInPeriod: number;
    
    // Métricas calculadas
    periodGrowthRate: number;
    periodEngagementRate: number;
    periodCompletionRate: number;
    
    // Identificador do período
    timeRange?: string;
    
    // Compatibilidade
    lastMonthGrowth: number;
    activeUsersLast7Days: number;
    contentEngagementRate: number;
  };
  loading: boolean;
}

export const RealStatsOverview = ({ data, loading }: RealStatsOverviewProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Função para formatar o tempo médio
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Encontrar o role com mais usuários (exceto admin)
  const dominantRole = data.usersByRole
    .filter(role => role.role !== 'Administradores')
    .sort((a, b) => b.count - a.count)[0];

  return (
    <div key={`stats-${data.timeRange || 'default'}`} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Linha 1: Dados cumulativos */}
      <StatCard
        title="Total de Usuários"
        value={data.totalUsers}
        icon={<Users className="h-5 w-5" />}
        percentageChange={data.periodGrowthRate}
        percentageText="crescimento no período"
        colorScheme="blue"
      />
      
      <StatCard
        title="Soluções Publicadas"
        value={data.totalSolutions}
        icon={<FileText className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Aulas Publicadas"
        value={data.totalLearningLessons}
        icon={<GraduationCap className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Total Implementações"
        value={data.completedImplementations}
        icon={<CheckCircle className="h-5 w-5" />}
        colorScheme="green"
      />
      
      {/* Linha 2: Dados específicos do período */}
      <StatCard
        title="Novos Usuários (Período)"
        value={data.newUsersInPeriod}
        icon={<UserPlus className="h-5 w-5" />}
        percentageChange={data.periodGrowthRate}
        percentageText="crescimento no período"
        colorScheme="green"
      />
      
      <StatCard
        title="Usuários Ativos (Período)"
        value={data.activeUsersInPeriod}
        icon={<Activity className="h-5 w-5" />}
        percentageChange={data.periodEngagementRate}
        percentageText="engajamento no período"
        colorScheme="blue"
      />
      
      <StatCard
        title="Implementações (Período)"
        value={data.implementationsInPeriod}
        icon={<Zap className="h-5 w-5" />}
        percentageText="implementações no período"
        colorScheme="orange"
      />
      
      <StatCard
        title="Taxa de Conclusão (%)"
        value={`${data.periodCompletionRate.toFixed(1)}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        percentageChange={data.periodCompletionRate > 50 ? 15.2 : -5.3}
        percentageText="taxa no período"
        colorScheme={data.periodCompletionRate > 50 ? "green" : "orange"}
      />
    </div>
  );
};
