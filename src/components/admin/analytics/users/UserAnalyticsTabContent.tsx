
import React from 'react';
import { useUserAnalyticsData } from '@/hooks/analytics/useUserAnalyticsData';
import { useTopActiveUsers } from '@/hooks/analytics/useTopActiveUsers';
import { UserStatCards } from './UserStatCards';
import { UserGrowthChart } from './UserGrowthChart';
import { UserRoleDistributionChart } from './UserRoleDistributionChart';
import { UserActivityByDayChart } from './UserActivityByDayChart';
import { TopActiveUsersTable } from './TopActiveUsersTable';
import { ModernLoadingState } from '../ModernLoadingState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface UserAnalyticsTabContentProps {
  timeRange: string;
  role: string;
}

export const UserAnalyticsTabContent = ({ timeRange, role }: UserAnalyticsTabContentProps) => {
  const { data, loading: dataLoading, error: dataError } = useUserAnalyticsData({ timeRange, role });
  const { users: activeUsers, loading: usersLoading, error: usersError } = useTopActiveUsers(10);

  const loading = dataLoading || usersLoading;
  const error = dataError || usersError;

  if (loading) {
    return <ModernLoadingState type="full" />;
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

  const newUsersToday = data.usersByTime.length > 0 ? data.usersByTime[data.usersByTime.length - 1]?.novos || 0 : 0;
  const growthRate = data.usersByTime.length > 1 ? 
    ((data.usersByTime[data.usersByTime.length - 1]?.novos || 0) / Math.max(1, data.usersByTime[data.usersByTime.length - 2]?.novos || 1) - 1) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Stats modernas */}
      <UserStatCards
        totalUsers={data.totalUsers}
        newUsersToday={newUsersToday}
        activeUsers={data.activeUsers}
        growthRate={growthRate}
      />

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={data.usersByTime} />
        <UserRoleDistributionChart data={data.userRoleDistribution} />
      </div>

      {/* Gráficos secundários e tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UserActivityByDayChart data={data.userActivityByDay} />
        </div>
        <div className="lg:col-span-2">
          <TopActiveUsersTable users={activeUsers} />
        </div>
      </div>
    </div>
  );
};
