
import React from 'react';
import { SolutionStatCards } from './SolutionStatCards';
import { SolutionPopularityChart } from './SolutionPopularityChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { DifficultyDistributionChart } from './DifficultyDistributionChart';
import { CompletionRatesChart } from './CompletionRatesChart';
import { SolutionsAnalyticsTable } from './SolutionsAnalyticsTable';
import { useSolutionAnalyticsData } from '@/hooks/admin/analytics/useSolutionAnalyticsData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SolutionsAnalyticsTabContentProps {
  timeRange: string;
}

export const SolutionsAnalyticsTabContent: React.FC<SolutionsAnalyticsTabContentProps> = ({ 
  timeRange 
}) => {
  const {
    totalSolutions,
    publishedSolutions,
    drafts,
    avgCompletionRate,
    popularSolutions,
    categoryDistribution,
    difficultyDistribution,
    completionRates,
    solutionsWithMetrics,
    loading,
    error
  } = useSolutionAnalyticsData(timeRange);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Ocorreu um erro ao carregar os dados analíticos das soluções: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <SolutionStatCards
        totalSolutions={totalSolutions}
        publishedSolutions={publishedSolutions}
        drafts={drafts}
        avgCompletionRate={avgCompletionRate}
        loading={loading}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <SolutionPopularityChart data={popularSolutions} />
        <CompletionRatesChart data={completionRates} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryDistributionChart data={categoryDistribution} />
        <DifficultyDistributionChart data={difficultyDistribution} />
      </div>

      <SolutionsAnalyticsTable data={solutionsWithMetrics || []} loading={loading} />
    </div>
  );
};
