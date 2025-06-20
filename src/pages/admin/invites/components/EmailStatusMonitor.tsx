
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Mail,
  Server,
  Shield,
  Zap
} from 'lucide-react';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';

export const EmailStatusMonitor: React.FC = () => {
  const { status, isChecking, checkHealth } = useResendHealthCheck();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    // Verificação inicial
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkHealth();
      }, 30000); // A cada 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, checkHealth]);

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getConnectivityBadge = (connectivity: string) => {
    switch (connectivity) {
      case 'connected':
        return <Badge className="bg-green-500">🟢 Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">🔴 Desconectado</Badge>;
      default:
        return <Badge variant="secondary">🟡 Desconhecido</Badge>;
    }
  };

  const getPerformanceLevel = (responseTime: number) => {
    if (responseTime < 1000) return { level: 'Excelente', color: 'text-green-600', progress: 100 };
    if (responseTime < 3000) return { level: 'Bom', color: 'text-blue-600', progress: 75 };
    if (responseTime < 5000) return { level: 'Aceitável', color: 'text-yellow-600', progress: 50 };
    return { level: 'Lento', color: 'text-red-600', progress: 25 };
  };

  const performance = getPerformanceLevel(status.responseTime);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Status do Sistema de Email
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={checkHealth}
                disabled={isChecking}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isChecking ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {isChecking ? 'Verificando...' : 'Atualizar'}
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
                variant={autoRefresh ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Zap className="h-3 w-3" />
                Auto
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded">
              {getStatusIcon(status.isHealthy)}
              <div>
                <h4 className={`font-medium ${getStatusColor(status.isHealthy)}`}>
                  Sistema Geral
                </h4>
                <p className="text-sm text-muted-foreground">
                  {status.isHealthy ? 'Operacional' : 'Indisponível'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded">
              {getStatusIcon(status.apiKeyValid)}
              <div>
                <h4 className={`font-medium ${getStatusColor(status.apiKeyValid)}`}>
                  API Key
                </h4>
                <p className="text-sm text-muted-foreground">
                  {status.apiKeyValid ? 'Válida' : 'Inválida'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded">
              {getStatusIcon(status.domainValid)}
              <div>
                <h4 className={`font-medium ${getStatusColor(status.domainValid)}`}>
                  Domínio
                </h4>
                <p className="text-sm text-muted-foreground">
                  {status.domainValid ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded">
              <Server className="h-4 w-4 text-blue-500" />
              <div>
                <h4 className="font-medium">Conectividade</h4>
                <div className="mt-1">
                  {getConnectivityBadge(status.connectivity)}
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Performance do Sistema</h4>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${performance.color}`}>
                  {performance.level}
                </span>
                <span className="text-sm text-muted-foreground">
                  {status.responseTime}ms
                </span>
              </div>
            </div>
            <Progress value={performance.progress} className="h-2" />
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <h5 className="font-medium text-gray-900">Última Verificação</h5>
              <p className="text-gray-600">
                {status.lastChecked.toLocaleString('pt-BR')}
              </p>
            </div>
            
            {status.lastError && (
              <div className="space-y-1">
                <h5 className="font-medium text-red-900">Último Erro</h5>
                <p className="text-red-700 text-xs">
                  {status.lastError}
                </p>
              </div>
            )}
          </div>

          {/* Issues */}
          {status.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Problemas Detectados
              </h4>
              <div className="space-y-1">
                {status.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm"
                  >
                    <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-800">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Positivo */}
          {status.isHealthy && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-800 text-sm font-medium">
                Sistema de email funcionando perfeitamente!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Provedor de Email
              </h4>
              <p className="text-blue-700">Resend.com - Serviço Premium</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-purple-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </h4>
              <p className="text-purple-700">Edge Functions + API Key Segura</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-green-900 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recursos Ativos
              </h4>
              <p className="text-green-700">
                {autoRefresh ? 'Monitoramento em Tempo Real' : 'Monitoramento Manual'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
