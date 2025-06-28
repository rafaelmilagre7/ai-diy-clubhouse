
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

  // Debug: mostrar dados no console
  console.log('[REAL-STATS] Dados recebidos:', {
    totalUsers: data.totalUsers,
    totalSolutions: data.totalSolutions,
    totalLearningLessons: data.totalLearningLessons,
    completedImplementations: data.completedImplementations,
    usersByRole: data.usersByRole
  });

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
    .filter(role => role.role !== 'admin')
    .sort((a, b) => b.count - a.count)[0];

  // Função para determinar a cor do indicador de crescimento
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "green";
    if (growth < 0) return "red";
    return "blue";
  };

  // Se não há dados, mostrar mensagem informativa
  if (data.totalUsers === 0 && data.totalSolutions === 0) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Aviso:</strong> Nenhum dado foi encontrado no banco. Verifique as permissões RLS ou se há dados nas tabelas.
          </p>
        </div>
        {[...Array(8)].map((_, i) => (
          <StatCard
            key={i}
            title="Sem dados"
            value="0"
            icon={<Users className="h-5 w-5" />}
            colorScheme="blue"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Usuários"
        value={data.totalUsers}
        icon={<Users className="h-5 w-5" />}
        percentageChange={data.lastMonthGrowth}
        percentageText={data.lastMonthGrowth !== 0 ? "vs período anterior" : "no período"}
        colorScheme={getGrowthColor(data.lastMonthGrowth)}
      />
      
      <StatCard
        title="Usuários Ativos"
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
        title="Aulas"
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
        value={`${dominantRole?.role || 'N/A'} (${dominantRole?.count || 0})`}
        icon={<Target className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Taxa de Conclusão"
        value={`${data.totalSolutions > 0 ? Math.round((data.completedImplementations / data.totalSolutions) * 100) : 0}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        percentageChange={data.completedImplementations > 0 ? 15.2 : 0}
        percentageText="estimativa de sucesso"
        colorScheme="green"
      />
    </div>
  );
};
