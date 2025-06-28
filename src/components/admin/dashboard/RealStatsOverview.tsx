
import { StatCard } from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, GraduationCap, CheckCircle, Clock, TrendingUp, Activity, Target } from "lucide-react";

interface RealStatsOverviewProps {
  data: {
    totalUsers: number;
    totalSolutions: number;
    totalLearningLessons: number;
    completedImplementations: number;
    averageImplementationTime: number;
    usersByRole: { role: string; count: number }[];
    lastMonthGrowth: number;
    activeUsersLast7Days: number;
    contentEngagementRate: number;
  } | null;
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

  if (!data) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center py-8 text-muted-foreground">
          Dados não disponíveis para o período selecionado
        </div>
      </div>
    );
  }

  // Função para formatar o tempo médio
  const formatTime = (minutes: number) => {
    if (minutes === 0) return "N/A";
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Encontrar o role com mais usuários (exceto admin)
  const dominantRole = data.usersByRole
    .filter(role => role.role !== 'admin' && role.role !== 'sem_role')
    .sort((a, b) => b.count - a.count)[0];

  // Função para determinar a cor do indicador de crescimento
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "green";
    if (growth < 0) return "red";
    return "blue";
  };

  // Calcular taxa de conclusão real
  const completionRate = data.totalSolutions > 0 ? 
    Math.round((data.completedImplementations / data.totalSolutions) * 100) : 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Usuários"
        value={data.totalUsers}
        icon={<Users className="h-5 w-5" />}
        percentageChange={data.lastMonthGrowth}
        percentageText={data.lastMonthGrowth !== 0 ? "crescimento mensal" : "sem crescimento"}
        colorScheme={getGrowthColor(data.lastMonthGrowth)}
      />
      
      <StatCard
        title="Usuários Ativos (7d)"
        value={data.activeUsersLast7Days}
        icon={<Activity className="h-5 w-5" />}
        percentageChange={data.contentEngagementRate}
        percentageText="taxa de engajamento"
        colorScheme="green"
      />
      
      <StatCard
        title="Soluções"
        value={data.totalSolutions}
        icon={<FileText className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Aulas LMS"
        value={data.totalLearningLessons}
        icon={<GraduationCap className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Implementações"
        value={data.completedImplementations}
        icon={<CheckCircle className="h-5 w-5" />}
        colorScheme="green"
      />
      
      <StatCard
        title="Tempo Médio"
        value={formatTime(data.averageImplementationTime)}
        icon={<Clock className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Role Predominante"
        value={dominantRole ? `${dominantRole.role} (${dominantRole.count})` : 'N/A'}
        icon={<Target className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Taxa de Conclusão"
        value={`${completionRate}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        colorScheme={completionRate > 50 ? "green" : completionRate > 0 ? "blue" : "red"}
      />
    </div>
  );
};
