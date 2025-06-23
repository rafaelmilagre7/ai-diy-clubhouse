
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  Settings,
  PlayCircle
} from 'lucide-react';
import { useHealthCheckData } from '@/hooks/admin/useHealthCheckData';
import { useAtRiskUsers } from '@/hooks/admin/useAtRiskUsers';
import { useHealthCheckInitializer } from '@/hooks/admin/invites/useHealthCheckInitializer';
import { HealthCheckProgressDialog } from './HealthCheckProgressDialog';
import { toast } from 'sonner';

export const UserHealthDashboard = () => {
  const { 
    healthMetrics, 
    healthStats, 
    loading: healthLoading, 
    error: healthError, 
    refetch: refetchHealth, 
    recalculateHealthScores 
  } = useHealthCheckData();

  const {
    atRiskUsers,
    loading: atRiskLoading,
    error: atRiskError,
    refetch: refetchAtRisk,
    triggerIntervention
  } = useAtRiskUsers();

  const { progress, initialize, reset, isProcessing } = useHealthCheckInitializer();
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const loading = healthLoading || atRiskLoading;
  const error = healthError || atRiskError;

  const handleInitialize = async () => {
    setShowProgressDialog(true);
    await initialize();
  };

  const handleRecalculateScores = async () => {
    try {
      await recalculateHealthScores();
      toast.success('Health scores recalculados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao recalcular scores: ' + error.message);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchHealth(), refetchAtRisk()]);
      toast.success('Dados atualizados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar dados: ' + error.message);
    }
  };

  const handleTriggerIntervention = async (userId: string) => {
    try {
      await triggerIntervention(userId);
      toast.success('Intervenção agendada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao agendar intervenção: ' + error.message);
    }
  };

  if (loading && !healthStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando dados de saúde...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Check dos Usuários</h2>
          <p className="text-gray-600">
            Monitore a saúde e engajamento dos usuários da plataforma
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleRecalculateScores}
            disabled={loading}
          >
            <Settings className="h-4 w-4 mr-2" />
            Recalcular
          </Button>

          <Button 
            onClick={handleInitialize}
            disabled={isProcessing}
          >
            <PlayCircle className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Processando...' : 'Inicializar'}
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários monitorados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats?.averageHealthScore || 0}</div>
            <p className="text-xs text-muted-foreground">Pontuação geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Saudáveis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthStats?.healthyUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Score maior ou igual a 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{healthStats?.atRiskUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Score entre 30-70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{healthStats?.criticalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Score menor que 30</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuários em risco */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários em Risco</CardTitle>
          <CardDescription>
            Usuários que necessitam atenção especial
          </CardDescription>
        </CardHeader>
        <CardContent>
          {atRiskUsers && atRiskUsers.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {atRiskUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.user_profile.name}</span>
                        <Badge 
                          variant={
                            user.risk_level === 'critical' ? 'destructive' :
                            user.risk_level === 'high' ? 'secondary' : 'outline'
                          }
                        >
                          {user.risk_level === 'critical' ? 'Crítico' :
                           user.risk_level === 'high' ? 'Alto' : 'Médio'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.user_profile.email}</p>
                      <div className="text-xs text-muted-foreground">
                        Health Score: {user.health_score} | 
                        Engajamento: {user.engagement_score} | 
                        Intervenções: {user.interventions_count}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTriggerIntervention(user.user_id)}
                    >
                      Intervir
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário em risco identificado
            </div>
          )}
        </CardContent>
      </Card>

      <HealthCheckProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        progress={progress}
        onCancel={reset}
      />
    </div>
  );
};
