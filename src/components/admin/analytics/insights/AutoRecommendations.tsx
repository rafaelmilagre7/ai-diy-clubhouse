
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useAutoRecommendations, AutoRecommendation } from '@/hooks/analytics/insights/useAutoRecommendations';

interface AutoRecommendationsProps {
  timeRange?: string;
}

export const AutoRecommendations: React.FC<AutoRecommendationsProps> = ({ timeRange }) => {
  const { data: recommendations = [], isLoading, error } = useAutoRecommendations();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recomendações Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recomendações Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Erro ao carregar recomendações</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recomendações Automáticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma recomendação disponível no momento
          </p>
        ) : (
          recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(recommendation.priority)}
                  <h4 className="font-medium">{recommendation.title}</h4>
                </div>
                <Badge className={getPriorityColor(recommendation.priority)}>
                  {recommendation.priority}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {recommendation.description}
              </p>

              {recommendation.metrics && (
                <div className="bg-muted/50 rounded p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Atual: {recommendation.metrics.current} {recommendation.metrics.unit}</span>
                    <span>Meta: {recommendation.metrics.target} {recommendation.metrics.unit}</span>
                  </div>
                  <div className="text-green-600 font-medium">
                    Melhoria esperada: {recommendation.metrics.improvement}
                  </div>
                </div>
              )}

              {recommendation.actionItems && recommendation.actionItems.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Ações recomendadas:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {recommendation.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Confiança: {Math.round(recommendation.confidence * 100)}%</span>
                {recommendation.impact && recommendation.effort && (
                  <span>
                    Impacto: {recommendation.impact} | Esforço: {recommendation.effort}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
