
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptimizedAnalyticsCache } from '@/hooks/analytics/useOptimizedAnalyticsCache';
import { Activity, Database, Zap, RefreshCw, TrendingUp } from 'lucide-react';

export const PerformanceMonitor = () => {
  const { getPerformanceStats, invalidateCache } = useOptimizedAnalyticsCache();
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(getPerformanceStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [getPerformanceStats]);

  if (!isVisible && import.meta.env.PROD) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  if (!stats) return null;

  const getHitRateColor = (hitRate: string) => {
    const rate = parseFloat(hitRate);
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceScore = () => {
    const hitRate = parseFloat(stats.hitRate);
    const cacheSize = stats.cacheStats.size;
    
    let score = 'Excelente';
    let color = 'text-green-600';
    
    if (hitRate < 60 || cacheSize > 40) {
      score = 'Precisa Melhorar';
      color = 'text-red-600';
    } else if (hitRate < 80 || cacheSize > 30) {
      score = 'Bom';
      color = 'text-yellow-600';
    }
    
    return { score, color };
  };

  const performance = getPerformanceScore();

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor de Performance
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <CardDescription className="text-xs">
          Estatísticas em tempo real do sistema de analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Performance Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Performance Geral</span>
          </div>
          <Badge className={performance.color} variant="outline">
            {performance.score}
          </Badge>
        </div>

        {/* Cache Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Taxa de Acerto do Cache</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getHitRateColor(stats.hitRate)}`} />
              <span className="text-sm font-mono">{stats.hitRate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Hits: {stats.cacheHits}</span>
            <span>Misses: {stats.cacheMisses}</span>
            <span>Total: {stats.totalRequests}</span>
          </div>
        </div>

        {/* Cache Size */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Entradas no Cache</span>
          <Badge variant="secondary">
            {stats.cacheStats.size}/50
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => invalidateCache()}
            className="flex-1 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Limpar Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('📊 Performance Stats:', stats);
              console.log('🔍 Cache Details:', stats.cacheStats);
            }}
            className="flex-1 text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            Debug
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
