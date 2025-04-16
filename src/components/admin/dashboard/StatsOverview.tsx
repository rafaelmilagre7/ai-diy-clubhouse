
import { StatCard } from "./StatCard";
import { Users, FileText, Award, Clock, TrendingUp, Activity } from "lucide-react";

interface StatsOverviewProps {
  data: {
    totalUsers: number;
    totalSolutions: number;
    completedImplementations: number;
    averageTime: number;
    userGrowth: number;
    implementationRate: number;
  };
}

export const StatsOverview = ({ data }: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total de Membros" 
        value={data.totalUsers} 
        icon={Users} 
        trend="up" 
        trendValue={data.userGrowth} 
      />
      <StatCard 
        title="Soluções Disponíveis" 
        value={data.totalSolutions} 
        icon={FileText} 
      />
      <StatCard 
        title="Implementações Completas" 
        value={data.completedImplementations} 
        icon={Award} 
        trend="up" 
        trendValue={8.3} 
      />
      <StatCard 
        title="Tempo Médio de Implementação" 
        value={`${data.averageTime} min`} 
        icon={Clock} 
        trend="down" 
        trendValue={4.2} 
      />
      <StatCard 
        title="Taxa de Implementação" 
        value={`${data.implementationRate}%`} 
        icon={TrendingUp} 
        trend="up" 
        trendValue={3.7} 
      />
      <StatCard 
        title="Atividade Diária" 
        value="36 usuários ativos" 
        icon={Activity} 
      />
    </div>
  );
};
