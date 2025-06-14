
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Eye, RefreshCw } from 'lucide-react';
import { secureSessionCache } from '@/utils/secureSessionCache';
import { intelligentRateLimit } from '@/utils/intelligentRateLimit';

export const SecurityMetricsWidget: React.FC = () => {
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [rateLimitStats, setrateLimitStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const sessionData = secureSessionCache.getStats();
      const rateLimitData = intelligentRateLimit.getStats();
      const recentAlerts = intelligentRateLimit.getRecentAlerts(5);
      
      setSessionStats(sessionData);
      setrateLimitStats(rateLimitData);
      setAlerts(recentAlerts);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas de segurança:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Métricas de Segurança Avançada</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshStats}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Cache de Sessão Seguro */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Cache de Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessões Ativas:</span>
                  <span className="text-sm font-medium">{sessionStats.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tab ID:</span>
                  <span className="text-xs font-mono">{sessionStats.tabId?.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mutexes:</span>
                  <span className="text-sm font-medium">{sessionStats.mutexCount}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Rate Limiting Inteligente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rateLimitStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IPs Rastreados:</span>
                  <span className="text-sm font-medium">{rateLimitStats.totalTrackedIPs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Requests Ativos:</span>
                  <span className="text-sm font-medium">{rateLimitStats.activeRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Blacklisted:</span>
                  <span className="text-sm font-medium text-red-600">{rateLimitStats.blacklistedIPs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Whitelisted:</span>
                  <span className="text-sm font-medium text-green-600">{rateLimitStats.whitelistedIPs}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Padrões */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              Padrões Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rateLimitStats?.patternDistribution ? (
              <div className="space-y-2">
                {Object.entries(rateLimitStats.patternDistribution).map(([pattern, count]) => (
                  <div key={pattern} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground capitalize">{pattern}:</span>
                    <Badge variant={pattern === 'malicious' ? 'destructive' : pattern === 'suspicious' ? 'secondary' : 'outline'}>
                      {count as number}
                    </Badge>
                  </div>
                ))}
                {Object.keys(rateLimitStats.patternDistribution).length === 0 && (
                  <div className="text-sm text-muted-foreground">Nenhum padrão detectado</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas Recentes */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Alertas de Segurança Recentes
            </CardTitle>
            <CardDescription>
              Últimos {alerts.length} alertas detectados pelo sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index} className="p-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          {alert.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Origem: {alert.source}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-green-600">
            ✅ Sistema de Segurança Avançada Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-medium text-green-800">Cache Seguro</div>
              <div className="text-green-600">Validação JWT</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-medium text-blue-800">Rate Limiting</div>
              <div className="text-blue-600">IA Integrada</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="font-medium text-purple-800">Detecção</div>
              <div className="text-purple-600">Padrões Maliciosos</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="font-medium text-orange-800">Monitoramento</div>
              <div className="text-orange-600">Tempo Real</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
