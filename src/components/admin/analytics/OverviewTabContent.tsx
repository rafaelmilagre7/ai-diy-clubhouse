
import React from 'react';
import { useOverviewData } from '@/hooks/analytics/useOverviewData';
import { ModernStatsCard } from './ModernStatsCard';
import { UserGrowthChart } from './UserGrowthChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { CompletionRateChart } from './CompletionRateChart';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      {/* Stats modernas */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Total de Usuários"
          value={data.totalUsers}
          change={data.totalUsersChange}
          icon="users"
          trend="up"
        />
        <ModernStatsCard
          title="Usuários Ativos"
          value={data.activeUsers}
          change={data.activeUsersChange}
          icon="activity"
          trend="up"
        />
        <ModernStatsCard
          title="Taxa de Conclusão"
          value={`${data.completionRate}%`}
          change={data.completionRateChange}
          icon="target"
          trend="up"
        />
        <ModernStatsCard
          title="Taxa de Engajamento"
          value={`${data.engagementRate}%`}
          change={data.engagementRateChange}
          icon="trending-up"
          trend="up"
        />
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart />
        <WeeklyActivityChart />
      </div>

      {/* Gráfico de conclusão */}
      <div>
        <CompletionRateChart />
      </div>
    </div>
  );
};
