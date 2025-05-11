
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/admin/useOnboardingAnalytics';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OnboardingOverviewSectionProps {
  data: OnboardingAnalyticsData;
}

export const OnboardingOverviewSection: React.FC<OnboardingOverviewSectionProps> = ({ data }) => {
  const { stats } = data;
  
  // Formatação dos valores
  const completionRateFormatted = `${stats.completionRate.toFixed(1)}%`;
  const averageStepsFormatted = stats.averageCompletionSteps.toFixed(1);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Badge variant={stats.totalUsers > 0 ? "default" : "outline"} className="ml-auto">
              {stats.totalUsers}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.partialUsers} incompletos | {stats.completedUsers} completos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Badge variant={stats.completionRate > 50 ? "default" : "outline"} className="ml-auto">
              {completionRateFormatted}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRateFormatted}</div>
            <Progress value={stats.completionRate} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completos</CardTitle>
            <Badge className="ml-auto">{stats.completedUsers}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 
                ? `${((stats.completedUsers / stats.totalUsers) * 100).toFixed(1)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapas Completadas (Média)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStepsFormatted}</div>
            <p className="text-xs text-muted-foreground">
              de 7 etapas totais
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Onboarding</CardTitle>
          <CardDescription>
            Número de usuários que iniciaram o onboarding ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {stats.usersByPeriod.length > 0 ? (
            <AreaChart 
              data={stats.usersByPeriod}
              categories={['total']}
              index="label"
              colors={['blue']}
              valueFormatter={(value) => `${value} usuários`}
              className="h-[300px]"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Não há dados suficientes para este período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
