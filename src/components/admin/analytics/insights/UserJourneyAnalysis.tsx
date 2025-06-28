
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingDown, 
  Clock, 
  Target,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useUserJourneyData } from '@/hooks/analytics/insights/useUserJourneyData';

export const UserJourneyAnalysis = () => {
  const { data, isLoading, error } = useUserJourneyData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análise da Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análise da Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar dados da jornada. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data.steps || data.steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análise da Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Dados insuficientes para análise da jornada
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStepColor = (completionRate: number) => {
    if (completionRate >= 80) return 'bg-green-500';
    if (completionRate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{data.total_users}</div>
                <div className="text-sm text-muted-foreground">Total de Usuários</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{data.completion_rate}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{Math.round(data.avg_journey_time / 60)}h</div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {data.steps && data.steps.length > 0 
                    ? Math.max(...data.steps.map(s => s.drop_off_rate))
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Maior Abandono</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Etapas da Jornada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${getStepColor(step.completion_rate)} flex items-center justify-center text-white text-sm font-bold`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.step}</h4>
                      <Badge variant="outline">
                        {step.users} usuários
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Taxa de conclusão: </span>
                        <span className="font-medium">{step.completion_rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tempo médio: </span>
                        <span className="font-medium">{step.avg_time_minutes}min</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taxa de abandono: </span>
                        <span className="font-medium text-red-600">{step.drop_off_rate}%</span>
                      </div>
                    </div>
                    
                    <Progress value={step.completion_rate} className="h-2" />
                  </div>
                </div>
                
                {index < data.steps.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-6 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
