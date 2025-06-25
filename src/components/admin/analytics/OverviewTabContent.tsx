
import React from 'react';
import { useOverviewData } from '@/hooks/analytics/useOverviewData';
import { ModernStatsCard } from './ModernStatsCard';
import { UserGrowthChart } from './UserGrowthChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { CompletionRateChart } from './CompletionRateChart';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Users, Activity, Target, TrendingUp } from 'lucide-react';

interface OverviewTabContentProps {
  timeRange: string;
}

export const OverviewTabContent = ({ timeRange }: OverviewTabContentProps) => {
  const { data, loading, error } = useOverviewData(timeRange);

  if (loading) {
    return <LoadingScreen variant="modern" type="full" fullScreen={false} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-0 shadow-xl bg-red-50/80 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Mock data para os gráficos
  const userGrowthData = [
    { name: 'Jan', novos: 20, total: 100 },
    { name: 'Fev', novos: 30, total: 130 },
    { name: 'Mar', novos: 25, total: 155 },
    { name: 'Abr', novos: 35, total: 190 }
  ];

  const weeklyActivityData = [
    { day: 'Seg', atividade: 45 },
    { day: 'Ter', atividade: 52 },
    { day: 'Qua', atividade: 48 },
    { day: 'Qui', atividade: 61 },
    { day: 'Sex', atividade: 55 },
    { day: 'Sáb', atividade: 30 },
    { day: 'Dom', atividade: 25 }
  ];

  const completionRateData = [
    { name: 'Concluídas', value: data.totalUsers * 0.78 },
    { name: 'Em Andamento', value: data.totalUsers * 0.22 }
  ];

  return (
    <div className="space-y-8">
      {/* Stats modernas */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Total de Usuários"
          value={data.totalUsers}
          icon={Users}
          trend={{
            value: data.totalUsersChange,
            label: "vs período anterior",
            type: "positive"
          }}
        />
        <ModernStatsCard
          title="Usuários Ativos"
          value={data.activeUsers}
          icon={Activity}
          trend={{
            value: data.activeUsersChange,
            label: "vs período anterior",
            type: "positive"
          }}
        />
        <ModernStatsCard
          title="Taxa de Conclusão"
          value={`${data.completionRate}%`}
          icon={Target}
          trend={{
            value: data.completionRateChange,
            label: "vs período anterior",
            type: "positive"
          }}
        />
        <ModernStatsCard
          title="Taxa de Engajamento"
          value={`${data.engagementRate}%`}
          icon={TrendingUp}
          trend={{
            value: data.engagementRateChange,
            label: "vs período anterior",
            type: "positive"
          }}
        />
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={userGrowthData} />
        <WeeklyActivityChart data={weeklyActivityData} />
      </div>

      {/* Gráfico de conclusão */}
      <div>
        <CompletionRateChart data={completionRateData} />
      </div>
    </div>
  );
};
