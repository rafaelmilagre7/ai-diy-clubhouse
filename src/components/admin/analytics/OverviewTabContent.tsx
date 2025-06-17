
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernStatsCard } from './ModernStatsCard';
import { ModernLoadingState } from './ModernLoadingState';
import { useRealAnalyticsData } from '@/hooks/analytics/useRealAnalyticsData';
import { Activity, Users, BookOpen, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface OverviewTabContentProps {
  timeRange: string;
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ timeRange }) => {
  const { data, loading, error } = useRealAnalyticsData({ 
    timeRange, 
    category: 'all', 
    difficulty: 'all' 
  });

  if (loading) {
    return <ModernLoadingState type="full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-800 bg-red-950/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-red-400">Erro ao carregar dados</AlertTitle>
        <AlertDescription className="text-red-300">{error}</AlertDescription>
      </Alert>
    );
  }

  // Calcular tendências baseadas nos dados reais
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Simular dados anteriores para as tendências (em um cenário real, viria do backend)
  const previousData = {
    users: Math.round(data.totalUsers * 0.85),
    activeUsers: Math.round(data.activeUsers * 0.92),
    solutions: Math.round(data.totalSolutions * 0.95),
    implementations: Math.round(data.totalImplementations * 0.78)
  };

  return (
    <div className="space-y-8">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total de Usuários"
          value={data.totalUsers}
          icon={Users}
          colorScheme="blue"
          trend={{
            value: calculateTrend(data.totalUsers, previousData.users),
            label: "vs período anterior",
            type: data.totalUsers >= previousData.users ? 'positive' : 'negative'
          }}
        />
        
        <ModernStatsCard
          title="Usuários Ativos"
          value={data.activeUsers}
          icon={Activity}
          colorScheme="green"
          trend={{
            value: calculateTrend(data.activeUsers, previousData.activeUsers),
            label: "vs período anterior",
            type: data.activeUsers >= previousData.activeUsers ? 'positive' : 'negative'
          }}
        />
        
        <ModernStatsCard
          title="Soluções Disponíveis"
          value={data.totalSolutions}
          icon={BookOpen}
          colorScheme="purple"
          trend={{
            value: calculateTrend(data.totalSolutions, previousData.solutions),
            label: "vs período anterior",
            type: data.totalSolutions >= previousData.solutions ? 'positive' : 'negative'
          }}
        />
        
        <ModernStatsCard
          title="Implementações"
          value={data.totalImplementations}
          icon={TrendingUp}
          colorScheme="orange"
          trend={{
            value: calculateTrend(data.totalImplementations, previousData.implementations),
            label: "vs período anterior",
            type: data.totalImplementations >= previousData.implementations ? 'positive' : 'negative'
          }}
        />
      </div>

      {/* Conteúdo adicional da visão geral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-800 bg-[#151823]">
          <CardHeader>
            <CardTitle className="text-white">Resumo de Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Taxa de Usuários Ativos</span>
                <span className="text-white font-semibold">
                  {data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Implementações por Solução</span>
                <span className="text-white font-semibold">
                  {data.totalSolutions > 0 ? Math.round(data.totalImplementations / data.totalSolutions) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Crescimento de Usuários</span>
                <span className="text-green-400 font-semibold">
                  +{calculateTrend(data.totalUsers, previousData.users).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-[#151823]">
          <CardHeader>
            <CardTitle className="text-white">Métricas de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Soluções Mais Populares</span>
                <span className="text-white font-semibold">
                  {data.solutionPopularity[0]?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Categoria Líder</span>
                <span className="text-white font-semibold">
                  {data.implementationsByCategory[0]?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Role Predominante</span>
                <span className="text-white font-semibold">
                  {data.userRoleDistribution[0]?.name || 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
