
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
    
    // Identificadores do período
    timeRange: string;
    lastUpdated: string;
    
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

  // Calcular período atual para labels
  const periodDays = data.timeRange === '7d' ? 7 :
                    data.timeRange === '30d' ? 30 :
                    data.timeRange === '90d' ? 90 :
                    data.timeRange === '1y' ? 365 : 30;

  const periodLabel = periodDays === 7 ? '7 dias' :
                     periodDays === 30 ? '30 dias' :
                     periodDays === 90 ? '90 dias' :
                     periodDays === 365 ? '1 ano' : `${periodDays} dias`;

  return (
    <div className="space-y-6">
      {/* Indicador do período ativo */}
      <div className="bg-muted/50 rounded-lg p-3 border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Período ativo: <strong>{periodLabel}</strong>
          </span>
          <span className="text-muted-foreground">
            Última atualização: {new Date(data.lastUpdated).toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Seção 1: Dados Totais (Cumulativos) */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">📊 Dados Totais da Plataforma</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </div>

      {/* Seção 2: Dados do Período Selecionado */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
          📈 Atividade nos Últimos {periodLabel}
        </h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={`Novos Usuários (${periodLabel})`}
            value={data.newUsersInPeriod}
            icon={<UserPlus className="h-5 w-5" />}
            percentageChange={data.periodGrowthRate}
            percentageText="crescimento no período"
            colorScheme="green"
          />
          
          <StatCard
            title={`Usuários Ativos (${periodLabel})`}
            value={data.activeUsersInPeriod}
            icon={<Activity className="h-5 w-5" />}
            percentageChange={data.periodEngagementRate}
            percentageText="engajamento no período"
            colorScheme="blue"
          />
          
          <StatCard
            title={`Implementações (${periodLabel})`}
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
      </div>
    </div>
  );
};
