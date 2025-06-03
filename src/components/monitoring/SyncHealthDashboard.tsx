
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSyncMonitor } from '@/hooks/monitoring/useSyncMonitor';
import { useCacheMonitor } from '@/hooks/monitoring/useCacheMonitor';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export const SyncHealthDashboard: React.FC = () => {
  const { issues, getSyncStats, clearOldIssues } = useSyncMonitor();
  const { getCacheStats, checkCacheConsistency } = useCacheMonitor();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const syncStats = getSyncStats();
  const cacheStats = getCacheStats();

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar consistência do cache periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      checkCacheConsistency();
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [checkCacheConsistency]);

  const getStatusColor = (count: number, type: 'error' | 'warning' | 'success') => {
    if (count === 0) return 'success';
    if (type === 'error' && count > 0) return 'destructive';
    if (type === 'warning' && count > 2) return 'warning';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monitor de Sincronização</h2>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="outline" className="text-green-600">
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={clearOldIssues}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Problemas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-4 w-4 ${
                syncStats.unresolvedIssues > 0 ? 'text-destructive' : 'text-muted-foreground'
              }`} />
              <span className="text-2xl font-bold">{syncStats.unresolvedIssues}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-4 w-4 ${
                syncStats.highPriorityIssues > 0 ? 'text-destructive' : 'text-muted-foreground'
              }`} />
              <span className="text-2xl font-bold text-destructive">
                {syncStats.highPriorityIssues}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{cacheStats.hitRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queries Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{cacheStats.totalQueries}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Problemas */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.slice(0, 10).map((issue) => (
                <div 
                  key={issue.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          issue.priority === 'high' ? 'destructive' :
                          issue.priority === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {issue.type}
                      </Badge>
                      <span className="font-medium">{issue.component}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {issue.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(issue.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas de Cache */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Queries Frescas</p>
              <p className="text-xl font-bold text-green-600">{cacheStats.freshQueries}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Queries Antigas</p>
              <p className="text-xl font-bold text-yellow-600">{cacheStats.staleQueries}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Com Erro</p>
              <p className="text-xl font-bold text-red-600">{cacheStats.errorQueries}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carregando</p>
              <p className="text-xl font-bold text-blue-600">{cacheStats.loadingQueries}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
