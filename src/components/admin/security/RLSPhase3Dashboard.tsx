
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAdvancedRLSMonitoring } from '@/hooks/useAdvancedRLSMonitoring';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Dashboard da Fase 3 - Monitoramento RLS Avançado
 */
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

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar o dashboard de segurança RLS.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRefresh = async () => {
    try {
      await fetchSecuritySummary();
      toast.success('Dados de segurança atualizados');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    }
  };

  const handleRegressionCheck = async () => {
    try {
      await runRegressionCheck();
      toast.success('Verificação de regressão executada');
    } catch (error) {
      toast.error('Erro na verificação de regressão');
    }
  };

  const getStatusIcon = () => {
    if (isSecure) return <ShieldCheck className="h-5 w-5 text-green-500" />;
    if (isCritical) return <ShieldAlert className="h-5 w-5 text-red-500" />;
    return <Shield className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusColor = () => {
    if (isSecure) return 'bg-green-50 border-green-200';
    if (isCritical) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">RLS Fase 3 - Monitoramento Avançado</h2>
            <p className="text-muted-foreground">
              Sistema de segurança com 100% de cobertura RLS e monitoramento automático
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRegressionCheck}
            disabled={loading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Verificar Regressão
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card className={getStatusColor()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Status de Segurança RLS
            <Badge variant={isSecure ? 'default' : isCritical ? 'destructive' : 'secondary'}>
              {securitySummary?.status || 'CARREGANDO'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{securityPercentage}%</div>
              <div className="text-sm text-muted-foreground">Cobertura de Segurança</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{protectedTables}</div>
              <div className="text-sm text-muted-foreground">Tabelas Protegidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{totalTables}</div>
              <div className="text-sm text-muted-foreground">Total de Tabelas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalTables}</div>
              <div className="text-sm text-muted-foreground">Tabelas Críticas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro no Monitoramento</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSecure && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sistema Seguro</AlertTitle>
          <AlertDescription>
            Todas as tabelas estão protegidas com RLS e políticas adequadas. 
            Monitoramento automático ativo.
          </AlertDescription>
        </Alert>
      )}

      {isCritical && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção: Problemas Críticos Detectados</AlertTitle>
          <AlertDescription>
            Existem {criticalTables} tabelas com problemas críticos de segurança. 
            Verifique imediatamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Alertas Recentes */}
      {alertsCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Alertas de Segurança Recentes
              <Badge variant="secondary">{alertsCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={alert.id || index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium">{alert.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.event_type} • {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes Técnicos */}
      {securitySummary && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Última Verificação:</span>
                <div className="text-muted-foreground">
                  {new Date(securitySummary.last_check).toLocaleString('pt-BR')}
                </div>
              </div>
              <div>
                <span className="font-medium">Tabelas sem RLS:</span>
                <div className="text-muted-foreground">
                  {securitySummary.rls_disabled_tables}
                </div>
              </div>
              <div>
                <span className="font-medium">Tabelas sem Políticas:</span>
                <div className="text-muted-foreground">
                  {securitySummary.no_policies_tables}
                </div>
              </div>
              <div>
                <span className="font-medium">Status do Sistema:</span>
                <div className="text-muted-foreground">
                  {securitySummary.status}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
