
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { UserStatCards } from './UserStatCards';
import { UserGrowthChart } from './UserGrowthChart';
import { UserRoleDistributionChart } from './UserRoleDistributionChart';
import { UserActivityByDayChart } from './UserActivityByDayChart';
import { TopActiveUsersTable } from './TopActiveUsersTable';
import { useUserAnalyticsData } from '@/hooks/admin/useUserAnalyticsData';

interface UserAnalyticsTabContentProps {
  timeRange: string;
}

export const UserAnalyticsTabContent: React.FC<UserAnalyticsTabContentProps> = ({ timeRange }) => {
  const { data, loading, error } = useUserAnalyticsData({ timeRange });

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-4 w-[240px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas chave */}
      <UserStatCards 
        totalUsers={data.totalUsers}
        newUsersToday={data.newUsersToday}
        activeUsers={data.activeUsersLast7Days}
        growthRate={data.growthRate}
      />
      
      {/* Gráficos principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserGrowthChart data={data.userGrowthData} />
        <UserRoleDistributionChart data={data.userRoleDistribution} />
      </div>
      
      {/* Atividade por dia */}
      <UserActivityByDayChart data={data.userActivityByDay} />
      
      {/* Tabela de usuários mais ativos */}
      <TopActiveUsersTable users={data.topActiveUsers} />
    </div>
  );
};
