
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useUserJourneyData } from '@/hooks/analytics/insights/useUserJourneyData';

interface UserJourneyAnalysisProps {
  timeRange?: string;
}

export const UserJourneyAnalysis: React.FC<UserJourneyAnalysisProps> = ({ timeRange }) => {
  const { data: journeyData, isLoading, error } = useUserJourneyData();

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !journeyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análise da Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Erro ao carregar dados da jornada</p>
        </CardContent>
      </Card>
    );
  }

  const totalSteps = journeyData.steps?.length || 0;
  const completedSteps = journeyData.steps?.filter(step => step.completed)?.length || 0;
  const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Análise da Jornada do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{journeyData.totalUsers || 0}</div>
            <div className="text-sm text-muted-foreground">Usuários Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(completionRate)}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{journeyData.averageTime || 0}min</div>
            <div className="text-sm text-muted-foreground">Tempo Médio</div>
          </div>
        </div>

        {/* Journey Steps */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Etapas da Jornada
          </h4>
          
          {journeyData.steps && journeyData.steps.length > 0 ? (
            journeyData.steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{step.name}</span>
                    {step.completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {step.completionRate}%
                  </span>
                </div>
                <Progress value={step.completionRate} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma etapa da jornada disponível
            </p>
          )}
        </div>

        {/* Bottlenecks */}
        {journeyData.bottlenecks && journeyData.bottlenecks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Gargalos Identificados
            </h4>
            {journeyData.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="border-l-4 border-orange-400 pl-3 py-2">
                <div className="font-medium text-sm">{bottleneck.step}</div>
                <div className="text-sm text-muted-foreground">{bottleneck.issue}</div>
                <div className="text-xs text-orange-600">
                  Taxa de abandono: {bottleneck.dropoffRate}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {journeyData.recommendations && journeyData.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-blue-900">Recomendações</h4>
            <ul className="space-y-1">
              {journeyData.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
