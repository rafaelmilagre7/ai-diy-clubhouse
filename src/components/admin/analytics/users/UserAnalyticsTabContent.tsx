
import React from 'react';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { AnalyticsMetricCard } from '../components/AnalyticsMetricCard';
import { EnhancedAreaChart, EnhancedPieChart } from '../charts';
import { useUserAnalyticsData } from '@/hooks/analytics/useUserAnalyticsData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, UserCheck, Activity, TrendingUp, UserPlus, Clock } from 'lucide-react';

interface UserAnalyticsTabContentProps {
  timeRange: string;
}

export const UserAnalyticsTabContent = ({ timeRange }: UserAnalyticsTabContentProps) => {
  const { data, loading, error } = useUserAnalyticsData({
    timeRange,
    role: 'all'
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Cálculos de métricas
  const activityRate = data?.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;
  const newUsersCount = data?.usersByTime && data.usersByTime.length > 0 
    ? data.usersByTime[data.usersByTime.length - 1]?.novos || 0
    : 0;

  const metrics = [
    {
      title: "Total de Usuários",
      value: data?.totalUsers || 0,
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      trend: { value: 12, label: "crescimento mensal" }
    },
    {
      title: "Usuários Ativos",
      value: data?.activeUsers || 0,
      icon: <UserCheck className="h-5 w-5" />,
      colorScheme: 'green' as const,
      trend: { value: 8, label: "vs semana anterior" }
    },
    {
      title: "Taxa de Atividade",
      value: `${activityRate}%`,
      icon: <Activity className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      trend: { value: 4, label: "melhoria contínua" }
    },
    {
      title: "Novos Usuários (30d)",
      value: newUsersCount,
      icon: <UserPlus className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      trend: { value: 15, label: "crescimento mensal" }
    },
    {
      title: "Taxa de Retenção",
      value: "78%",
      icon: <TrendingUp className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      trend: { value: 3, label: "usuários retornando" }
    },
    {
      title: "Tempo Médio Online",
      value: "24 min",
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      trend: { value: 5, label: "por sessão" }
    }
  ];

  return (
    <AnalyticsTabContainer>
      {/* Metric Cards */}
      <AnalyticsMetricsGrid columns={3}>
        {metrics.map((metric, index) => (
          <AnalyticsMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            colorScheme={metric.colorScheme}
            trend={metric.trend}
            loading={loading}
          />
        ))}
      </AnalyticsMetricsGrid>

      {/* Charts */}
      <AnalyticsChartsGrid>
        <EnhancedAreaChart
          data={data?.usersByTime || []}
          title="Crescimento de Usuários"
          description="Evolução do número de usuários ao longo do tempo"
          categories={['novos', 'total']}
          index="date"
          colors={['hsl(var(--info))', 'hsl(var(--aurora-primary))']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          size="medium"
          curved={true}
        />
        
        <EnhancedPieChart
          data={data?.userRoleDistribution || []}
          title="Distribuição de Papéis"
          description="Distribuição de usuários por tipo de papel"
          category="value"
          index="name"
          colors={['hsl(var(--aurora-primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          size="medium"
          showLegend={true}
        />
      </AnalyticsChartsGrid>
      
      {/* Weekly Activity Chart */}
      <AnalyticsChartsGrid columns={1}>
        <EnhancedAreaChart
          data={data?.userActivityByDay || []}
          title="Atividade Semanal dos Usuários"
          description="Padrão de atividade dos usuários ao longo da semana"
          categories={['atividade']}
          index="day"
          colors={['hsl(var(--aurora-primary))']}
          valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
          size="large"
          curved={true}
        />
      </AnalyticsChartsGrid>
    </AnalyticsTabContainer>
  );
};
