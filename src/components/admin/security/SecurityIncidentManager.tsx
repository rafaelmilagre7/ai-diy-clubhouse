
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Users, TrendingDown, Activity } from 'lucide-react';
import { useHealthCheckData } from '@/hooks/admin/useHealthCheckData';
import { useAtRiskUsers } from '@/hooks/admin/useAtRiskUsers';
import { initializeHealthCheckData } from '@/utils/healthCheckInitializer';
import { toast } from 'sonner';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  created_by: string;
  created_at: string;
  resolved_at?: string;
  metadata?: any;
}

interface SecurityIncidentManagerProps {
  incidents: SecurityIncident[];
}

export const SecurityIncidentManager: React.FC<SecurityIncidentManagerProps> = ({ incidents }) => {
  const { stats, loading: healthLoading, error: healthError, recalculateHealthScores } = useHealthCheckData();
  const { atRiskUsers, loading: riskLoading, triggerIntervention } = useAtRiskUsers();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitializeHealthCheck = async () => {
    setIsInitializing(true);
    try {
      const result = await initializeHealthCheckData();
      
      if (result.success) {
        toast.success('Health Check inicializado com sucesso!', {
          description: `${result.details.totalUsers} usuários processados`
        });
      } else {
        toast.error('Falha na inicialização do Health Check', {
          description: result.details.errors.join(', ')
        });
      }
    } catch (error: any) {
      toast.error('Erro ao inicializar Health Check', {
        description: error.message
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRecalculateScores = async () => {
    try {
      await recalculateHealthScores();
      toast.success('Health scores recalculados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao recalcular scores', {
        description: error.message
      });
    }
  };

  const handleTriggerIntervention = async (userId: string) => {
    try {
      await triggerIntervention(userId);
      toast.success('Intervenção agendada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao agendar intervenção', {
        description: error.message
      });
    }
  };

  const getRiskColor = (level: 'critical' | 'high' | 'medium') => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Ações de Inicialização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Controle do Health Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleInitializeHealthCheck} 
              disabled={isInitializing}
              variant="outline"
            >
              {isInitializing ? 'Inicializando...' : 'Inicializar Health Check'}
            </Button>
            <Button 
              onClick={handleRecalculateScores} 
              disabled={healthLoading}
              variant="outline"
            >
              Recalcular Scores
            </Button>
          </div>
          
          {healthError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {healthError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Saúde */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.healthyUsers}</p>
                  <p className="text-sm text-muted-foreground">Usuários Saudáveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.atRiskUsers}</p>
                  <p className="text-sm text-muted-foreground">Em Risco</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalUsers}</p>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Usuários em Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários em Risco ({atRiskUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando usuários em risco...</p>
            </div>
          ) : atRiskUsers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum usuário em risco encontrado</p>
              <p className="text-sm text-muted-foreground">Todos os usuários estão com bons níveis de engajamento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskUsers.slice(0, 10).map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getRiskColor(user.risk_level)} text-white`}>
                      {user.risk_level.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{user.user_profile.name}</p>
                      <p className="text-sm text-muted-foreground">{user.user_profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Score: {user.health_score}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.interventions_count} intervenções
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTriggerIntervention(user.user_id)}
                    >
                      Intervir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidentes de Segurança Tradicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Incidentes de Segurança ({incidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum incidente ativo</p>
              <p className="text-sm text-muted-foreground">O sistema está funcionando normalmente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={incident.severity === 'critical' ? 'destructive' : 'outline'}>
                      {incident.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {incident.status === 'resolved' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-500" />
                    )}
                    <span className="text-sm capitalize">{incident.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
