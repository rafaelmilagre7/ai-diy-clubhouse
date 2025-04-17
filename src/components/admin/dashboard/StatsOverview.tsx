
import { StatCard } from "./StatCard";
import { Users, FileText, Award, Clock, TrendingUp, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        value={data.totalUsers > 0 ? `${Math.round(data.totalUsers * 0.3)} usuários ativos` : "0 usuários ativos"} 
        icon={Activity} 
      />
    </div>
  );
};
