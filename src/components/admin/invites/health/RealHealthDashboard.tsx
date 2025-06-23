
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  AlertCircle,
  UserX
} from 'lucide-react';
import { useRealHealthCheck } from '@/hooks/admin/invites/useRealHealthCheck';

export const RealHealthDashboard = () => {
  const { progress, calculateMetrics, reset, isLoading } = useRealHealthCheck();

  const renderContent = () => {
    switch (progress.stage) {
      case 'idle':
        return (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Health Check do Sistema</h3>
            <p className="text-muted-foreground mb-4">
              Analise a saúde dos usuários com base em dados reais do sistema
            </p>
            <Button onClick={calculateMetrics} className="gap-2">
              <Activity className="h-4 w-4" />
              Calcular Métricas
            </Button>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Calculando Métricas</h3>
            <p className="text-muted-foreground">{progress.message}</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2 text-red-600">Erro ao Calcular Métricas</h3>
            <p className="text-muted-foreground mb-4">{progress.message}</p>
            {progress.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{progress.error}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={reset}>
                Voltar
              </Button>
              <Button onClick={calculateMetrics}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        );

      case 'empty':
        return (
          <div className="text-center py-8">
            <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Sistema Vazio</h3>
            <p className="text-muted-foreground mb-4">
              Nenhum usuário encontrado no sistema para análise
            </p>
            <Button variant="outline" onClick={reset}>
              Voltar
            </Button>
          </div>
        );

      case 'success':
        if (!progress.data) return null;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Métricas de Saúde dos Usuários</h3>
                <p className="text-muted-foreground">{progress.message}</p>
              </div>
              <Button variant="outline" onClick={calculateMetrics} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total de Usuários</p>
                      <p className="text-2xl font-bold">{progress.data.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Score Médio</p>
                      <p className="text-2xl font-bold">{progress.data.averageScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Usuários Saudáveis</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{progress.data.healthyUsers}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          ≥70
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Usuários em Risco</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{progress.data.atRiskUsers + progress.data.criticalUsers}</p>
                        <Badge variant="destructive">
                          &lt;70
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Saudáveis (≥70)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{progress.data.healthyUsers}</span>
                        <div className="w-12 h-2 bg-green-200 rounded">
                          <div 
                            className="h-full bg-green-500 rounded"
                            style={{ 
                              width: `${(progress.data.healthyUsers / progress.data.totalUsers) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Em Risco (40-69)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{progress.data.atRiskUsers}</span>
                        <div className="w-12 h-2 bg-yellow-200 rounded">
                          <div 
                            className="h-full bg-yellow-500 rounded"
                            style={{ 
                              width: `${(progress.data.atRiskUsers / progress.data.totalUsers) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Críticos (&lt;40)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{progress.data.criticalUsers}</span>
                        <div className="w-12 h-2 bg-red-200 rounded">
                          <div 
                            className="h-full bg-red-500 rounded"
                            style={{ 
                              width: `${(progress.data.criticalUsers / progress.data.totalUsers) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Taxa de Usuários Saudáveis:</span>{' '}
                      {Math.round((progress.data.healthyUsers / progress.data.totalUsers) * 100)}%
                    </p>
                    <p>
                      <span className="font-medium">Usuários Precisando Atenção:</span>{' '}
                      {progress.data.atRiskUsers + progress.data.criticalUsers}
                    </p>
                    <p>
                      <span className="font-medium">Score Médio Geral:</span>{' '}
                      {progress.data.averageScore}/100
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Health Check do Sistema
        </CardTitle>
        <CardDescription>
          Monitoramento da saúde dos usuários baseado em dados reais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
