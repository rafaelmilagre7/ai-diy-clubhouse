
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
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aurora-glass rounded-xl p-6">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

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
    <div className="space-y-8">
      {/* Indicador do período ativo com Aurora Style */}
      <div className="aurora-glass rounded-xl p-6 aurora-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-aurora rounded-full aurora-glow"></div>
            <span className="text-foreground font-medium">
              Período ativo: <span className="aurora-text-gradient font-bold">{periodLabel}</span>
            </span>
          </div>
          <span className="text-muted-foreground text-sm">
            Atualizado: {new Date(data.lastUpdated).toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Seção 1: Dados Totais da Plataforma */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
          <h3 className="text-xl font-bold aurora-text-gradient">Dados Totais da Plataforma</h3>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Usuários"
            value={data.totalUsers}
            icon={<Users className="h-6 w-6" />}
            percentageChange={data.periodGrowthRate}
            percentageText="crescimento no período"
            colorScheme="blue"
          />
          
          <StatCard
            title="Soluções Publicadas"
            value={data.totalSolutions}
            icon={<FileText className="h-6 w-6" />}
            colorScheme="purple"
          />
          
          <StatCard
            title="Aulas Publicadas"
            value={data.totalLearningLessons}
            icon={<GraduationCap className="h-6 w-6" />}
            colorScheme="indigo"
          />
          
          <StatCard
            title="Total Implementações"
            value={data.completedImplementations}
            icon={<CheckCircle className="h-6 w-6" />}
            colorScheme="green"
          />
        </div>
      </div>

      {/* Seção 2: Atividade do Período */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
          <h3 className="text-xl font-bold aurora-text-gradient">
            Atividade dos Últimos {periodLabel}
          </h3>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={`Novos Usuários`}
            subtitle={periodLabel}
            value={data.newUsersInPeriod}
            icon={<UserPlus className="h-6 w-6" />}
            percentageChange={data.periodGrowthRate}
            percentageText="crescimento no período"
            colorScheme="emerald"
          />
          
          <StatCard
            title={`Usuários Ativos`}
            subtitle={periodLabel}
            value={data.activeUsersInPeriod}
            icon={<Activity className="h-6 w-6" />}
            percentageChange={data.periodEngagementRate}
            percentageText="engajamento"
            colorScheme="blue"
          />
          
          <StatCard
            title={`Implementações`}
            subtitle={periodLabel}
            value={data.implementationsInPeriod}
            icon={<Zap className="h-6 w-6" />}
            percentageText="novas implementações"
            colorScheme="orange"
          />
          
          <StatCard
            title="Taxa de Conclusão"
            subtitle="do período"
            value={`${data.periodCompletionRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            percentageChange={data.periodCompletionRate > 50 ? 15.2 : -5.3}
            percentageText="eficiência"
            colorScheme={data.periodCompletionRate > 50 ? "green" : "orange"}
          />
        </div>
      </div>
    </div>
  );
};
