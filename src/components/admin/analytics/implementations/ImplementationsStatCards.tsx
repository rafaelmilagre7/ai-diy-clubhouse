
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, CheckCircle2, Clock, FileText } from 'lucide-react';
import { ImplementationData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface ImplementationsStatCardsProps {
  stats: {
    completionRate: ImplementationData['completionRate'];
    totalImplementations: number;
    avgCompletionTime: number | null;
    abandonmentRate: number;
  };
  loading: boolean;
}

export const ImplementationsStatCards: React.FC<ImplementationsStatCardsProps> = ({ 
  stats, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-8 w-1/2 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionPercent = stats.totalImplementations > 0 
    ? Math.round((stats.completionRate.completed / stats.totalImplementations) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {stats.totalImplementations}
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Total de implementações</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Acompanhe o número total de implementações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {completionPercent}%
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span>Taxa de conclusão</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs flex items-center gap-1 text-muted-foreground">
            {stats.completionRate.completed} concluídas / {stats.completionRate.inProgress} em andamento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {stats.avgCompletionTime ? `${stats.avgCompletionTime} dias` : 'N/A'}
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Tempo médio de conclusão</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Duração média da implementação
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {stats.abandonmentRate}%
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <span>{stats.abandonmentRate > 30 ? <ArrowUp className="h-4 w-4 text-destructive" /> : <ArrowDown className="h-4 w-4 text-success" />}</span>
            <span>Taxa de abandono</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            % de usuários que não finalizam
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
