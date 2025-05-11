
import React from 'react';
import { ImplementationsStatCards } from './ImplementationsStatCards';
import { CompletionTimeChart } from './CompletionTimeChart';
import { DifficultyDistributionChart } from './DifficultyDistributionChart';
import { AbandonmentRateChart } from './AbandonmentRateChart';
import { RecentImplementationsTable } from './RecentImplementationsTable';
import { useImplementationsAnalyticsData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface ImplementationsAnalyticsTabContentProps {
  timeRange: string;
}

export const ImplementationsAnalyticsTabContent: React.FC<ImplementationsAnalyticsTabContentProps> = ({ timeRange }) => {
  const { data, isLoading } = useImplementationsAnalyticsData(timeRange);
  
  // Calcular estatísticas gerais
  const totalImplementations = 
    (data?.completionRate?.completed || 0) + (data?.completionRate?.inProgress || 0);
  
  // Calcular tempo médio geral de todas as implementações
  const avgCompletionTime = data?.averageCompletionTime?.length 
    ? data.averageCompletionTime.reduce((sum, item) => sum + item.avgDays * item.count, 0) / 
      data.averageCompletionTime.reduce((sum, item) => sum + item.count, 0)
    : null;
  
  // Calcular taxa média de abandono
  const abandonmentRate = data?.abandonmentByModule?.length 
    ? Math.round(data.abandonmentByModule.reduce((sum, item) => sum + item.abandonmentRate, 0) / data.abandonmentByModule.length)
    : 0;
  
  // Estatísticas para os cartões
  const stats = {
    completionRate: data?.completionRate || { completed: 0, inProgress: 0 },
    totalImplementations,
    avgCompletionTime: avgCompletionTime !== null ? Math.round(avgCompletionTime * 10) / 10 : null, // Arredondar para 1 casa decimal
    abandonmentRate
  };
  
  return (
    <div className="space-y-6">
      <ImplementationsStatCards stats={stats} loading={isLoading} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <RecentImplementationsTable 
          data={data?.recentImplementations || []} 
          loading={isLoading} 
        />
      </div>
    </div>
  );
};
