
import React from 'react';
import { useAdvancedRLSMonitoring } from '@/hooks/useAdvancedRLSMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, Activity, RefreshCw, Zap, Eye, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export const RLSPhase3Dashboard = () => {
  const {
    securitySummary,
    securityAlerts,
    loading,
    error,
    fetchSecuritySummary,
    runRegressionCheck,
    isAdmin,
    isSecure,
    isCritical,
    securityPercentage,
    totalTables,
    protectedTables,
    criticalTables,
    alertsCount
  } = useAdvancedRLSMonitoring();

  const handleRefresh = async () => {
    await fetchSecuritySummary();
  };

  const handleRunRegression = async () => {
    try {
      await runRegressionCheck();
    } catch (error) {
      console.error('Erro ao executar verificação de regressão:', error);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar o dashboard de segurança RLS.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            Dashboard RLS - Fase 3 Completa
          </h2>
          <p className="text-neutral-300">
            Sistema de Row Level Security com monitoramento automático
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={handleRunRegression} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Activity className="h-4 w-4 mr-2" />
            Verificar Regressão
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Proteção RLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{securityPercentage}%</div>
            <p className="text-xs text-green-100">
              {protectedTables}/{totalTables} tabelas protegidas
            </p>
            <Progress value={securityPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Tabelas Seguras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{protectedTables}</div>
            <p className="text-xs text-blue-100">
              Com RLS ativo e políticas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Monitoramento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24/7</div>
            <p className="text-xs text-purple-100">
              Detecção automática ativa
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{alertsCount}</div>
            <p className="text-xs text-orange-100">
              Eventos de segurança
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Geral */}
      {securitySummary && (
        <Alert className={`${
          isSecure 
            ? 'bg-green-900/20 border-green-500/50 text-green-300'
            : isCritical 
            ? 'bg-red-900/20 border-red-500/50 text-red-300'
            : 'bg-yellow-900/20 border-yellow-500/50 text-yellow-300'
        }`}>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Status do Sistema:</strong> {securitySummary.status}
                {securityPercentage === 100 && (
                  <span className="ml-2">🎉 PROTEÇÃO COMPLETA ALCANÇADA!</span>
                )}
              </div>
              <Badge variant={isSecure ? 'default' : isCritical ? 'destructive' : 'secondary'}>
                {securityPercentage}% Protegido
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Últimos Alertas de Segurança */}
      {securityAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-orange-500" />
              Atividade de Segurança Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.slice(0, 5).map((alert, index) => (
                <div key={alert.id || index} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{alert.event_type}</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recursos da Fase 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-blue-500" />
            Recursos Avançados - Fase 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">🔍 Monitoramento Automático</h4>
              <p className="text-sm text-neutral-300">
                Verificação contínua de integridade RLS com detecção de regressão em tempo real.
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">🚨 Sistema de Alertas</h4>
              <p className="text-sm text-neutral-300">
                Notificações imediatas para violações de segurança e anomalias do sistema.
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">📊 Análise Comportamental</h4>
              <p className="text-sm text-neutral-300">
                Detecção inteligente de padrões suspeitos e atividades anômalas.
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">🔧 Auto-Correção</h4>
              <p className="text-sm text-neutral-300">
                Capacidade de executar correções automáticas para problemas detectados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      {securitySummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Total de Tabelas</p>
                <p className="text-white font-semibold">{totalTables}</p>
              </div>
              <div>
                <p className="text-neutral-400">Tabelas Protegidas</p>
                <p className="text-white font-semibold">{protectedTables}</p>
              </div>
              <div>
                <p className="text-neutral-400">Issues Críticos</p>
                <p className="text-white font-semibold">{criticalTables}</p>
              </div>
              <div>
                <p className="text-neutral-400">Última Verificação</p>
                <p className="text-white font-semibold">
                  {securitySummary.last_check ? 
                    new Date(securitySummary.last_check).toLocaleString('pt-BR') : 
                    'Agora'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2 text-blue-500" />
          <p className="text-neutral-300">Carregando dados de segurança...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
