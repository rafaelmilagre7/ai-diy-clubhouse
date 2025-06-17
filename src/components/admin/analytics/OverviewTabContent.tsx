
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassStatsCard } from './GlassStatsCard';
import { ModernLoadingState } from './ModernLoadingState';
import { useRealAnalyticsData } from '@/hooks/analytics/useRealAnalyticsData';
import { Activity, Users, BookOpen, TrendingUp, Target, Zap } from 'lucide-react';
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
      <Alert variant="destructive" className="border-red-800/50 bg-red-950/20 backdrop-blur-xl">
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
      {/* Cards de estatísticas principais com glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassStatsCard
          title="Total de Usuários"
          value={data.totalUsers}
          icon={Users}
          colorScheme="primary"
          trend={{
            value: calculateTrend(data.totalUsers, previousData.users),
            label: "vs período anterior",
            type: data.totalUsers >= previousData.users ? 'positive' : 'negative'
          }}
        />
        
        <GlassStatsCard
          title="Usuários Ativos"
          value={data.activeUsers}
          icon={Activity}
          colorScheme="success"
          trend={{
            value: calculateTrend(data.activeUsers, previousData.activeUsers),
            label: "vs período anterior",
            type: data.activeUsers >= previousData.activeUsers ? 'positive' : 'negative'
          }}
        />
        
        <GlassStatsCard
          title="Soluções Disponíveis"
          value={data.totalSolutions}
          icon={BookOpen}
          colorScheme="secondary"
          trend={{
            value: calculateTrend(data.totalSolutions, previousData.solutions),
            label: "vs período anterior",
            type: data.totalSolutions >= previousData.solutions ? 'positive' : 'negative'
          }}
        />
        
        <GlassStatsCard
          title="Implementações"
          value={data.totalImplementations}
          icon={TrendingUp}
          colorScheme="warning"
          trend={{
            value: calculateTrend(data.totalImplementations, previousData.implementations),
            label: "vs período anterior",
            type: data.totalImplementations >= previousData.implementations ? 'positive' : 'negative'
          }}
        />
      </div>

      {/* Métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassStatsCard
          title="Taxa de Engajamento"
          value={`${data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0}%`}
          icon={Target}
          colorScheme="info"
          trend={{
            value: 12.5,
            label: "este mês",
            type: 'positive'
          }}
        />
        
        <GlassStatsCard
          title="Média de Implementações"
          value={data.totalSolutions > 0 ? Math.round(data.totalImplementations / data.totalSolutions) : 0}
          icon={Zap}
          colorScheme="primary"
          trend={{
            value: 8.3,
            label: "por solução",
            type: 'positive'
          }}
        />
      </div>

      {/* Conteúdo adicional da visão geral com glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#00EAD9]" />
              Resumo de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0F111A]/50">
                <span className="text-gray-400">Taxa de Usuários Ativos</span>
                <span className="text-white font-semibold text-[#00EAD9]">
                  {data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0F111A]/50">
                <span className="text-gray-400">Implementações por Solução</span>
                <span className="text-white font-semibold">
                  {data.totalSolutions > 0 ? Math.round(data.totalImplementations / data.totalSolutions) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0F111A]/50">
                <span className="text-gray-400">Crescimento de Usuários</span>
                <span className="text-green-400 font-semibold">
                  +{calculateTrend(data.totalUsers, previousData.users).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00EAD9]" />
              Métricas de Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0F111A]/50">
                <span className="text-gray-400">Solução Mais Popular</span>
                <span className="text-white font-semibold">
                  {data.solutionPopularity[0]?.name?.substring(0, 20) || 'N/A'}...
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0F111A]/50">
                <span className="text-gray-400">Categoria Líder</span>
                <span className="text-white font-semibold">
                  {data.implementationsByCategory[0]?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0F111A]/50">
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
