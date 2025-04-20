
import { StatCard } from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, FileText, Timer, Percent, Activity } from "lucide-react";

interface StatsOverviewProps {
  data: {
    totalUsers: number;
    totalSolutions: number;
    completedImplementations: number;
    averageTime: number;
    userGrowth: number;
    implementationRate: number;
  };
  loading: boolean;
}

export const StatsOverview = ({ data, loading }: StatsOverviewProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
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

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total de Membros"
        value={data.totalUsers}
        icon={<Users className="h-5 w-5" />}
        percentageChange={data.userGrowth}
        percentageText="que o mês anterior"
        colorScheme="blue"
      />
      
      <StatCard
        title="Soluções Disponíveis"
        value={data.totalSolutions}
        icon={<FileText className="h-5 w-5" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Implementações Completas"
        value={data.completedImplementations}
        icon={<TrendingUp className="h-5 w-5" />}
        percentageChange={8.3}
        percentageText="que o mês anterior"
        colorScheme="green"
      />
      
      <StatCard
        title="Tempo Médio de Implementação"
        value={formatTime(data.averageTime)}
        icon={<Timer className="h-5 w-5" />}
        percentageChange={-4.2}
        percentageText="que o mês anterior"
        reverseColors={true}
        colorScheme="blue"
      />
      
      <StatCard
        title="Taxa de Implementação"
        value={`${data.implementationRate}%`}
        icon={<Percent className="h-5 w-5" />}
        percentageChange={3.7}
        percentageText="que o mês anterior"
        colorScheme="green"
      />
      
      <StatCard
        title="Atividade Diária"
        value="4 usuários ativos"
        icon={<Activity className="h-5 w-5" />}
        colorScheme="blue"
      />
    </div>
  );
};
