
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernStatsCard } from './ModernStatsCard';
import { ModernLoadingState } from './ModernLoadingState';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { Activity, Users, BookOpen, TrendingUp } from 'lucide-react';

interface OverviewTabContentProps {
  timeRange: string;
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ timeRange }) => {
  const { data, loading, error } = useAnalyticsData({ 
    timeRange, 
    category: 'all', 
    difficulty: 'all' 
  });

  if (loading) {
    return <ModernLoadingState type="full" />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  // Dados simulados para demonstração
  const overviewStats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalSolutions: 45,
    implementations: 320
  };

  return (
    <div className="space-y-8">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total de Usuários"
          value={overviewStats.totalUsers}
          icon={Users}
          colorScheme="blue"
          trend={{
            value: 12.5,
            label: "vs mês anterior",
            type: 'positive'
          }}
        />
        
        <ModernStatsCard
          title="Usuários Ativos"
          value={overviewStats.activeUsers}
          icon={Activity}
          colorScheme="green"
          trend={{
            value: 8.3,
            label: "vs mês anterior",
            type: 'positive'
          }}
        />
        
        <ModernStatsCard
          title="Soluções Disponíveis"
          value={overviewStats.totalSolutions}
          icon={BookOpen}
          colorScheme="purple"
          trend={{
            value: 15.2,
            label: "vs mês anterior",
            type: 'positive'
          }}
        />
        
        <ModernStatsCard
          title="Implementações"
          value={overviewStats.implementations}
          icon={TrendingUp}
          colorScheme="orange"
          trend={{
            value: 22.7,
            label: "vs mês anterior",
            type: 'positive'
          }}
        />
      </div>

      {/* Conteúdo adicional da visão geral seria aqui */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Resumo de Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Gráfico de atividade geral seria exibido aqui.</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Métricas de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Métricas de engajamento seriam exibidas aqui.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
