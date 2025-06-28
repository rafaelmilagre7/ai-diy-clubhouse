
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, TrendingUp, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAutoRecommendations } from '@/hooks/analytics/insights/useAutoRecommendations';

export const AutoRecommendations = () => {
  const { data, isLoading, error } = useAutoRecommendations();

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
          <div className="space-y-4">
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

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recomendações Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar recomendações. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return TrendingUp;
      case 'low': return Target;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recomendações Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendations.map((rec) => {
              const PriorityIcon = getPriorityIcon(rec.priority);
              
              return (
                <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <PriorityIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="space-y-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Impacto Estimado</div>
                      <div className="flex items-center gap-2">
                        <Progress value={Number(rec.impact) * 20} className="flex-1" />
                        <span className="text-sm">{rec.impact}/5</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Esforço Necessário</div>
                      <div className="flex items-center gap-2">
                        <Progress value={Number(rec.effort) * 20} className="flex-1" />
                        <span className="text-sm">{rec.effort}/5</span>
                      </div>
                    </div>
                  </div>

                  {rec.metrics && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Atual: </span>
                        <span className="font-medium">{rec.metrics.currentValue}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Meta: </span>
                        <span className="font-medium">{rec.metrics.targetValue}</span>
                      </div>
                      <div className="col-span-2 text-sm">
                        <span className="text-muted-foreground">Melhoria esperada: </span>
                        <span className="font-medium text-green-600">{rec.metrics.improvement}</span>
                      </div>
                    </div>
                  )}

                  {rec.actionItems && rec.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Ações Recomendadas:</div>
                      <ul className="text-sm space-y-1">
                        {rec.actionItems.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t">
                    <Button variant="outline" size="sm">
                      Aplicar Recomendação
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
