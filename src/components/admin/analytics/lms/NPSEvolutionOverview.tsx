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
    if (score >= 50) return 'text-success';
    if (score >= 0) return 'text-warning';
    return 'text-destructive';
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
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+{npsChange.toFixed(1)}</span>
              </>
            ) : npsChange < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-destructive">{npsChange.toFixed(1)}</span>
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
      <Card className="border-l-4 border-l-success">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-success" />
            Promotores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">
            {promotersPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {currentData?.promoters || 0} usuários
          </div>
          <div className="mt-1 text-xs text-success">
            Notas 9-10
          </div>
        </CardContent>
      </Card>

      {/* Neutros */}
      <Card className="border-l-4 border-l-warning">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Minus className="h-4 w-4 text-warning" />
            Neutros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning">
            {neutralsPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {currentData?.neutrals || 0} usuários
          </div>
          <div className="mt-1 text-xs text-warning">
            Notas 7-8
          </div>
        </CardContent>
      </Card>

      {/* Detratores */}
      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-destructive" />
            Detratores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">
            {detractorsPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {currentData?.detractors || 0} usuários
          </div>
          <div className="mt-1 text-xs text-destructive">
            Notas 0-6
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
