
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useUserHealthDashboard } from '@/hooks/admin/invites/useUserHealthDashboard';
import { toast } from 'sonner';

export const UserHealthDashboard = () => {
  const {
    metrics,
    users,
    alerts,
    loading,
    error,
    recalculateHealthScores,
    resolveAlert,
    dismissAlert,
    refreshData
  } = useUserHealthDashboard();

  const handleRecalculate = async () => {
    toast.loading('Recalculando scores de saúde...');
    await recalculateHealthScores();
    toast.dismiss();
    toast.success('Scores recalculados com sucesso!');
  };

  const handleResolveAlert = async (alertId: string) => {
    await resolveAlert(alertId);
    toast.success('Alerta resolvido!');
  };

  const handleDismissAlert = async (alertId: string) => {
    await dismissAlert(alertId);
    toast.success('Alerta dispensado!');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de saúde dos usuários: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="ml-2"
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Check dos Usuários</h2>
          <p className="text-muted-foreground">
            Monitoramento de saúde e engajamento dos usuários em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleRecalculate}
            disabled={loading}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Recalcular Scores
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : metrics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Saudáveis</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '-' : metrics.healthyUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUsers > 0 ? 
                `${Math.round((metrics.healthyUsers / metrics.totalUsers) * 100)}%` : 
                '0%'
              } do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? '-' : metrics.atRiskUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUsers > 0 ? 
                `${Math.round((metrics.atRiskUsers / metrics.totalUsers) * 100)}%` : 
                '0%'
              } do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '-' : metrics.criticalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalUsers > 0 ? 
                `${Math.round((metrics.criticalUsers / metrics.totalUsers) * 100)}%` : 
                '0%'
              } do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : metrics.averageHealthScore}</div>
            <Progress value={metrics.averageHealthScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas {alerts.length > 0 && `(${alerts.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários por Score de Saúde</CardTitle>
              <CardDescription>
                Lista de usuários ordenada por score de saúde (menor primeiro)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando dados dos usuários...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado de usuário encontrado. Execute o recálculo de scores.
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={getRiskBadgeVariant(user.risk_level)}>
                            {user.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">
                            Score Geral: {user.overall_score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Eng: {user.engagement_score} | 
                            Ativ: {user.activity_score} | 
                            Prog: {user.progress_score}
                          </div>
                        </div>
                        
                        <div className="w-20">
                          <Progress value={user.overall_score} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Ativos</CardTitle>
              <CardDescription>
                Alertas de usuários que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando alertas...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum alerta ativo encontrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${getSeverityColor(alert.severity)}`} />
                            <span className="font-medium">{alert.title}</span>
                            <Badge variant="outline">{alert.alert_type}</Badge>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Usuário:</strong> {alert.user_name} ({alert.user_email})
                          </p>
                          
                          <p className="text-sm">{alert.message}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Dispensar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
