
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useOnboardingHealth } from '@/hooks/admin/invites/useOnboardingHealth';
import { Badge } from '@/components/ui/badge';

export const OnboardingHealthDashboard = () => {
  const { 
    metrics, 
    loading, 
    error, 
    refetch 
  } = useOnboardingHealth();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Erro ao Carregar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Saúde do Onboarding</h2>
          <p className="text-muted-foreground">
            Monitoramento das métricas de integração de novos usuários
          </p>
        </div>
        <Button onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Completo</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completedOnboarding}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completionRate.toFixed(1)}% de taxa de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandonaram</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.abandonedOnboarding}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - metrics.completionRate).toFixed(1)}% de abandono
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageCompletionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Para completar onboarding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conclusão Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <Badge variant={metrics.completionRate >= 70 ? "default" : metrics.completionRate >= 50 ? "secondary" : "destructive"}>
              {metrics.completionRate.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={metrics.completionRate} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {metrics.completedOnboarding} de {metrics.totalUsers} usuários completaram o onboarding
          </p>
        </CardContent>
      </Card>

      {/* Step Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conclusão por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.stepCompletionRates.map((step) => (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Etapa {step.step}</span>
                  <span className="text-sm text-muted-foreground">{step.completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={step.completionRate} className="w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Completions */}
      <Card>
        <CardHeader>
          <CardTitle>Conclusões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentCompletions.length > 0 ? (
            <div className="space-y-4">
              {metrics.recentCompletions.map((completion, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Usuário: {completion.userId.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">
                      Completado em: {new Date(completion.completedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {completion.timeToComplete.toFixed(1)}h
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma conclusão recente encontrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Most Common Abandonment Point */}
      <Card>
        <CardHeader>
          <CardTitle>Ponto de Abandono Mais Comum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-amber-600">{metrics.mostCommonAbandonmentStep}</div>
            <p className="text-sm text-muted-foreground mt-2">
              A maioria dos usuários abandona o processo nesta etapa
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
