
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useEmailDiagnostics, DiagnosticResult, EmailSystemHealth } from '@/hooks/admin/invites/useEmailDiagnostics';

export const EmailDiagnosticsPanel = () => {
  const { runDiagnostics, isRunning, health } = useEmailDiagnostics();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    // Executar diagnóstico inicial
    runDiagnostics();
  }, [runDiagnostics]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        runDiagnostics();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh, runDiagnostics]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const getOverallIcon = (overall: EmailSystemHealth['overall']) => {
    switch (overall) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatResponseTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Diagnóstico do Sistema de Email</h3>
          <div className="flex items-center gap-2">
            {getOverallIcon(health.overall)}
            <Badge variant={health.overall === 'healthy' ? 'default' : health.overall === 'degraded' ? 'secondary' : 'destructive'}>
              {health.overall === 'healthy' ? 'Saudável' : 
               health.overall === 'degraded' ? 'Degradado' : 'Crítico'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-blue-50 border-blue-200' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Verificando...' : 'Verificar Agora'}
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getOverallIcon(health.overall)}
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {health.components.filter(c => c.status === 'success').length}
              </div>
              <div className="text-sm text-green-600">Componentes OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {health.components.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-sm text-yellow-600">Com Avisos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {health.components.filter(c => c.status === 'error').length}
              </div>
              <div className="text-sm text-red-600">Com Problemas</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Última verificação: {health.lastCheck.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Componentes Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {health.components.map((component, index) => (
          <Card key={index} className={getStatusColor(component.status)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(component.status)}
                  {component.component}
                </div>
                {component.responseTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatResponseTime(component.responseTime)}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{component.message}</p>
              {component.details && (
                <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(component.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sugestões */}
      {health.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sugestões de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.suggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <AlertDescription>{suggestion}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">
                {Math.round(health.components.reduce((acc, c) => acc + (c.responseTime || 0), 0) / health.components.length)}ms
              </div>
              <div className="text-sm text-muted-foreground">Tempo Médio</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.max(...health.components.map(c => c.responseTime || 0))}ms
              </div>
              <div className="text-sm text-muted-foreground">Tempo Máximo</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {((health.components.filter(c => c.status === 'success').length / health.components.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {health.components.length}
              </div>
              <div className="text-sm text-muted-foreground">Componentes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
