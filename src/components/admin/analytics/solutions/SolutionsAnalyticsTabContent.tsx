
import React from 'react';
import { PopularSolutionsChart } from '../PopularSolutionsChart';
import { ImplementationsByCategoryChart } from '../ImplementationsByCategoryChart';
import { GlassStatsCard } from '../GlassStatsCard';
import { useRealAnalyticsData } from '@/hooks/analytics/useRealAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Package, TrendingUp, Target } from 'lucide-react';

interface SolutionsAnalyticsTabContentProps {
  timeRange: string;
}

export const SolutionsAnalyticsTabContent = ({ timeRange }: SolutionsAnalyticsTabContentProps) => {
  const { data, loading, error } = useRealAnalyticsData({
    timeRange,
    category: 'all',
    difficulty: 'all'
  });

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-[120px] mb-2 bg-gray-700/50" />
              <Skeleton className="h-8 w-[80px] bg-gray-700/50" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardHeader>
            <Skeleton className="h-6 w-[200px] bg-gray-700/50" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-gray-700/50" />
          </CardContent>
        </Card>
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardHeader>
            <Skeleton className="h-6 w-[200px] bg-gray-700/50" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-gray-700/50" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
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

  const totalSolutions = data?.solutionPopularity?.length || 0;
  const totalImplementations = data?.implementationsByCategory?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
  const avgImplementationsPerSolution = totalSolutions > 0 ? Math.round(totalImplementations / totalSolutions) : 0;

  return (
    <div className="space-y-8">
      {/* Cards de estatísticas com glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassStatsCard
          title="Total de Soluções"
          value={totalSolutions}
          icon={Package}
          colorScheme="primary"
          trend={{
            value: 15.2,
            label: "vs mês anterior",
            type: 'positive'
          }}
        />
        
        <GlassStatsCard
          title="Implementações Totais"
          value={totalImplementations}
          icon={TrendingUp}
          colorScheme="success"
          trend={{
            value: 23.8,
            label: "vs mês anterior",
            type: 'positive'
          }}
        />
        
        <GlassStatsCard
          title="Média por Solução"
          value={avgImplementationsPerSolution}
          icon={Target}
          colorScheme="secondary"
          trend={{
            value: 8.5,
            label: "implementações",
            type: 'positive'
          }}
        />
      </div>

      {/* Gráficos com tema moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PopularSolutionsChart data={data?.solutionPopularity || []} />
        <ImplementationsByCategoryChart data={data?.implementationsByCategory || []} />
      </div>
    </div>
  );
};
