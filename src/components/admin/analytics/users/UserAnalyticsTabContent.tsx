
import React from 'react';
import { UserRoleDistributionChart } from './UserRoleDistributionChart';
import { UserGrowthChart } from './UserGrowthChart';
import { EnhancedAreaChart, EnhancedPieChart } from '../charts';
import { EnhancedMetricCard } from '../components/EnhancedMetricCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { useUserAnalyticsData } from '@/hooks/analytics/useUserAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, UserCheck, Activity, TrendingUp, UserPlus, Clock, Target } from 'lucide-react';

interface UserAnalyticsTabContentProps {
  timeRange: string;
}

export const UserAnalyticsTabContent = ({ timeRange }: UserAnalyticsTabContentProps) => {
  const { data, loading, error } = useUserAnalyticsData({
    timeRange,
    role: 'all'
  });

  const renderSkeleton = () => (
    <div className="space-y-6">
      <MetricsGrid>
        {Array(6).fill(0).map((_, i) => (
          <EnhancedMetricCard
            key={i}
            title="Carregando..."
            value={0}
            loading={true}
          />
        ))}
      </MetricsGrid>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[350px] bg-muted animate-pulse rounded-lg" />
        <div className="h-[350px] bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Dados de sparkline simulados para últimos 7 dias
  const generateSparklineData = (baseValue: number, trend: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.max(0, baseValue + Math.random() * trend * (i + 1) / 7),
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  // Cálculos de métricas
  const activityRate = data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;
  const newUsersGrowth = 15; // Mock - em produção viria dos dados
  const retentionRate = 78; // Mock - em produção viria dos dados

  const enhancedMetrics = [
    {
      title: "Total de Usuários",
      value: data.totalUsers?.toLocaleString() || '0',
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      priority: 'high' as const,
      trend: {
        value: 12,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(data.totalUsers || 0, 50)
    },
    {
      title: "Usuários Ativos",
      value: data.activeUsers?.toLocaleString() || '0',
      icon: <UserCheck className="h-5 w-5" />,
      colorScheme: 'green' as const,
      priority: 'high' as const,
      trend: {
        value: 8,
        label: "vs semana anterior"
      },
      sparklineData: generateSparklineData(data.activeUsers || 0, 20)
    },
    {
      title: "Taxa de Atividade",
      value: `${activityRate}%`,
      icon: <Activity className="h-5 w-5" />,
      colorScheme: 'cyan' as const,
      priority: 'medium' as const,
      trend: {
        value: 4,
        label: "melhoria contínua"
      }
    },
    {
      title: "Novos Usuários (30d)",
      value: data.newUsersToday?.toLocaleString() || '0',
      icon: <UserPlus className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      priority: 'medium' as const,
      trend: {
        value: newUsersGrowth,
        label: "crescimento mensal"
      },
      sparklineData: generateSparklineData(data.newUsersToday || 0, 15)
    },
    {
      title: "Taxa de Retenção",
      value: `${retentionRate}%`,
      icon: <Target className="h-5 w-5" />,
      colorScheme: 'orange' as const,
      priority: 'medium' as const,
      trend: {
        value: 3,
        label: "usuários retornando"
      }
    },
    {
      title: "Tempo Médio Online",
      value: "24 min",
      icon: <Clock className="h-5 w-5" />,
      colorScheme: 'indigo' as const,
      priority: 'low' as const,
      trend: {
        value: 5,
        label: "por sessão"
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Metric Cards */}
      <MetricsGrid columns={3} gap="md">
        {enhancedMetrics.map((metric, index) => (
          <EnhancedMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            colorScheme={metric.colorScheme}
            priority={metric.priority}
            trend={metric.trend}
            sparklineData={metric.sparklineData}
          />
        ))}
      </MetricsGrid>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedAreaChart
          data={data.usersByTime || []}
          title="Crescimento de Usuários"
          description="Evolução do número de usuários ao longo do tempo"
          categories={['novos', 'total']}
          index="date"
          colors={['#3B82F6', '#0ABAB5']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          size="medium"
          curved={true}
        />
        
        <EnhancedPieChart
          data={data.userRoleDistribution || []}
          title="Distribuição de Papéis"
          description="Distribuição de usuários por tipo de papel"
          category="value"
          index="name"
          colors={['#0ABAB5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
          valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
          size="medium"
          showLegend={true}
        />
      </div>
      
      {/* Weekly Activity Chart */}
      <EnhancedAreaChart
        data={data.userActivityByDay || []}
        title="Atividade Semanal dos Usuários"
        description="Padrão de atividade dos usuários ao longo da semana"
        categories={['atividade']}
        index="day"
        colors={['#0ABAB5']}
        valueFormatter={(value) => `${value} atividade${value !== 1 ? 's' : ''}`}
        size="large"
        curved={true}
      />
    </div>
  );
};
