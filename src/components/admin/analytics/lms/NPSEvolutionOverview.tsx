import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
import type { NPSMonthlyEvolution } from '@/hooks/analytics/lms/types';

interface NPSEvolutionOverviewProps {
  currentData: NPSMonthlyEvolution | null;
  previousData: NPSMonthlyEvolution | null;
  isLoading: boolean;
}

export const NPSEvolutionOverview: React.FC<NPSEvolutionOverviewProps> = ({
  currentData,
  previousData,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const npsScore = currentData?.nps_score || 0;
  const previousNPS = previousData?.nps_score || 0;
  const npsChange = npsScore - previousNPS;

  const promotersPercent = currentData?.total_responses 
    ? (currentData.promoters / currentData.total_responses) * 100 
    : 0;
  
  const neutralsPercent = currentData?.total_responses 
    ? (currentData.neutrals / currentData.total_responses) * 100 
    : 0;
  
  const detractorsPercent = currentData?.total_responses 
    ? (currentData.detractors / currentData.total_responses) * 100 
    : 0;

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* NPS Atual */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            NPS Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getNPSColor(npsScore)}`}>
            {npsScore.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            {npsChange > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+{npsChange.toFixed(1)}</span>
              </>
            ) : npsChange < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-red-600">{npsChange.toFixed(1)}</span>
              </>
            ) : (
              <span>Sem mudança</span>
            )}
            <span className="ml-1">vs. mês anterior</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {currentData?.total_responses || 0} respostas
          </div>
        </CardContent>
      </Card>

      {/* Promotores */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-600" />
            Promotores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {promotersPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {currentData?.promoters || 0} usuários
          </div>
          <div className="mt-1 text-xs text-green-600">
            Notas 9-10
          </div>
        </CardContent>
      </Card>

      {/* Neutros */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Minus className="h-4 w-4 text-yellow-600" />
            Neutros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">
            {neutralsPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {currentData?.neutrals || 0} usuários
          </div>
          <div className="mt-1 text-xs text-yellow-600">
            Notas 7-8
          </div>
        </CardContent>
      </Card>

      {/* Detratores */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-red-600" />
            Detratores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {detractorsPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {currentData?.detractors || 0} usuários
          </div>
          <div className="mt-1 text-xs text-red-600">
            Notas 0-6
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
