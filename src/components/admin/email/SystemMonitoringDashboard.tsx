
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useEmailSystemMonitor } from '@/hooks/admin/email/useEmailSystemMonitor';

export const SystemMonitoringDashboard: React.FC = () => {
  const {
    metrics,
    isMonitoring,
    performHealthCheck
  } = useEmailSystemMonitor();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">✅ Saudável</Badge>;
      case 'degraded':
        return <Badge variant="secondary">⚠️ Degradado</Badge>;
      case 'down':
        return <Badge variant="destructive">❌ Fora do Ar</Badge>;
      default:
        return <Badge variant="outline">❓ Desconhecido</Badge>;
    }
  };

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime < 1000) return { color: 'text-green-600', status: 'Excelente' };
    if (responseTime < 3000) return { color: 'text-yellow-600', status: 'Bom' };
    if (responseTime < 5000) return { color: 'text-orange-600', status: 'Lento' };
    return { color: 'text-red-600', status: 'Crítico' };
  };

  const responseTimeStatus = getResponseTimeStatus(metrics.responseTime);

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoramento em Tempo Real
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(metrics.status)}
              <Button
                onClick={performHealthCheck}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Verificar Agora
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tempo de Resposta */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Tempo de Resposta</span>
              </div>
              <div className={`text-2xl font-bold ${responseTimeStatus.color}`}>
                {metrics.responseTime}ms
              </div>
              <div className="text-sm text-muted-foreground">
                {responseTimeStatus.status}
              </div>
            </div>

            {/* Taxa de Sucesso */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Taxa de Sucesso</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.successRate}%
              </div>
              <div className="text-sm text-muted-foreground">
                {metrics.successRate >= 95 ? 'Excelente' : 
                 metrics.successRate >= 85 ? 'Bom' : 'Atenção Necessária'}
              </div>
            </div>

            {/* Erros Recentes */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Erros</span>
              </div>
              <div className={`text-2xl font-bold ${metrics.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.errorCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Últimas 24h
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Verificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Última Verificação:</span>
            <span className="text-sm text-muted-foreground">
              {metrics.lastCheck.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monitoramento Ativo:</span>
            <div className="flex items-center gap-2">
              {isMonitoring ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Ativo</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Inativo</span>
                </>
              )}
            </div>
          </div>

          {metrics.recentErrors.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Erros Recentes:</h4>
                {metrics.recentErrors.map((error, index) => (
                  <div
                    key={index}
                    className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="space-y-1 text-sm">
              <h4 className="font-medium text-blue-900">📊 Monitoramento Automático:</h4>
              <ul className="space-y-0.5 text-blue-800 text-xs">
                <li>• Verificação a cada 2 minutos</li>
                <li>• Alertas automáticos para falhas</li>
                <li>• Métricas de performance em tempo real</li>
                <li>• Histórico de erros e recuperações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
