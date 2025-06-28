
import React from 'react';
import { useImplementationsAnalyticsData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';
import { ImplementationsStatCards } from './ImplementationsStatCards';
import { CompletionTimeChart } from './CompletionTimeChart';
import { DifficultyDistributionChart } from './DifficultyDistributionChart';
import { AbandonmentRateChart } from './AbandonmentRateChart';
import { RecentImplementationsTable } from './RecentImplementationsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const ImplementationsAnalyticsTabContent = () => {
  const { data, isLoading, error, refetch } = useImplementationsAnalyticsData();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Ocorreu um erro ao carregar os dados de implementações.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <ImplementationsStatCards data={data} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompletionTimeChart 
          data={data?.averageCompletionTime || []} 
          loading={isLoading} 
        />
        <DifficultyDistributionChart 
          data={data?.implementationsByDifficulty || []} 
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AbandonmentRateChart 
          data={data?.abandonmentByModule || []} 
          loading={isLoading}
        />
        <RecentImplementationsTable 
          data={data?.recentImplementations || []} 
          loading={isLoading}
        />
      </div>
    </div>
  );
};
