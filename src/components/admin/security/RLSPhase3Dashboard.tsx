
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Eye,
  Server,
  Activity
} from 'lucide-react';
import { useAdvancedRLSMonitoring } from '@/hooks/useAdvancedRLSMonitoring';
import { useRLSValidation } from '@/hooks/useRLSValidation';

export const RLSPhase3Dashboard = () => {
  const {
    securitySummary,
    securityAlerts,
    loading,
    error,
    fetchSecuritySummary,
    runRegressionCheck,
    isSecure,
    isCritical,
    securityPercentage,
    totalTables,
    protectedTables,
    criticalTables,
    alertsCount
  } = useAdvancedRLSMonitoring();

  const {
    validateCompleteRLS,
    getSecurityStats,
    isAdmin
  } = useRLSValidation();

  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Executar verificação completa
  const handleCompleteValidation = async () => {
    if (!isAdmin) return;

    setIsValidating(true);
    try {
      const results = await validateCompleteRLS();
      setValidationResults(results);
    } catch (error) {
      console.error('Erro na validação completa:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Executar verificação de regressão
  const handleRegressionCheck = async () => {
    if (!isAdmin) return;
    
    try {
      await runRegressionCheck();
      await fetchSecuritySummary();
    } catch (error) {
      console.error('Erro na verificação de regressão:', error);
    }
  };

  // Recarregar dados
  const handleRefresh = async () => {
    await Promise.all([
      fetchSecuritySummary(),
      handleCompleteValidation()
    ]);
  };

  useEffect(() => {
    if (isAdmin) {
      handleCompleteValidation();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar o dashboard RLS Fase 3.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score de Segurança</p>
                <p className="text-2xl font-bold text-green-400">{securityPercentage}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tabelas Protegidas</p>
                <p className="text-2xl font-bold text-blue-400">{protectedTables}/{totalTables}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues Críticas</p>
                <p className="text-2xl font-bold text-red-400">{criticalTables}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-yellow-400">{alertsCount}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status geral */}
      {securitySummary && (
        <Alert className={`${
          isSecure ? 'bg-green-900/20 border-green-500/50 text-green-300' :
          isCritical ? 'bg-red-900/20 border-red-500/50 text-red-300' :
          'bg-yellow-900/20 border-yellow-500/50 text-yellow-300'
        }`}>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Status do Sistema:</strong> {
              isSecure ? 'Totalmente Seguro - 100% das tabelas protegidas' :
              isCritical ? `Sistema Crítico - ${criticalTables} tabelas vulneráveis` :
              `Sistema em Alerta - ${100 - securityPercentage}% das tabelas precisam de atenção`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Controles de ação */}
      <div className="flex gap-4">
        <Button 
          onClick={handleRefresh}
          disabled={loading || isValidating}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(loading || isValidating) ? 'animate-spin' : ''}`} />
          Atualizar Dashboard
        </Button>

        <Button 
          onClick={handleRegressionCheck}
          disabled={loading}
          variant="outline"
          className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
        >
          <Eye className="h-4 w-4 mr-2" />
          Verificar Regressão
        </Button>

        <Button 
          onClick={handleCompleteValidation}
          disabled={isValidating}
          variant="outline"
          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
        >
          <Server className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          Validação Completa
        </Button>
      </div>

      {/* Tabela de resultados de validação */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-blue-400" />
              Status Detalhado das Tabelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-2 text-neutral-300">Tabela</th>
                    <th className="text-left p-2 text-neutral-300">RLS</th>
                    <th className="text-left p-2 text-neutral-300">Políticas</th>
                    <th className="text-left p-2 text-neutral-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResults.map((result, index) => (
                    <tr key={index} className="border-b border-neutral-800">
                      <td className="p-2 text-white font-mono text-xs">
                        {result.table_name}
                      </td>
                      <td className="p-2">
                        <Badge variant={result.rls_enabled ? "default" : "destructive"}>
                          {result.rls_enabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-2 text-neutral-300">
                        {result.policy_count} política{result.policy_count !== 1 ? 's' : ''}
                      </td>
                      <td className="p-2">
                        <span className={`
                          ${result.security_status.includes('PROTEGIDO') ? 'text-green-400' :
                            result.security_status.includes('DESABILITADO') ? 'text-yellow-400' :
                            result.security_status.includes('SEM PROTEÇÃO') ? 'text-red-400' :
                            'text-neutral-400'}
                        `}>
                          {result.security_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de segurança recentes */}
      {securityAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Alertas de Segurança Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts.slice(0, 10).map((alert, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg border-neutral-700 bg-neutral-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {alert.event_type}
                    </Badge>
                    <span className="text-xs text-neutral-400">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300">{alert.action}</p>
                  {alert.details && (
                    <pre className="text-xs text-neutral-400 mt-2 bg-neutral-900 p-2 rounded overflow-x-auto">
                      {JSON.stringify(alert.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações da Fase 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Recursos da Fase 3 RLS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-400">✅ Implementado</h4>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Monitoramento automático 24/7</li>
                <li>• Detecção de regressão em tempo real</li>
                <li>• Alertas inteligentes por severidade</li>
                <li>• Dashboard avançado de segurança</li>
                <li>• Validação completa de políticas RLS</li>
                <li>• Logs de auditoria detalhados</li>
                <li>• Cobertura de 100% das tabelas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-400">🔧 Funcionalidades</h4>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Verificação automática de regressão</li>
                <li>• Análise de compatibilidade RLS</li>
                <li>• Monitoramento de tentativas de violação</li>
                <li>• Relatórios de segurança personalizados</li>
                <li>• Integração com sistema de notificações</li>
                <li>• Backup automático de configurações</li>
                <li>• Histórico completo de mudanças</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
