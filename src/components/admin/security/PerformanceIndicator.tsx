
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Timer, AlertCircle } from 'lucide-react';

interface PerformanceIndicatorProps {
  renderTime: number;
  cacheHitRatio: number;
  workerAvailable: boolean;
  componentName: string;
}

export const PerformanceIndicator = memo<PerformanceIndicatorProps>(({
  renderTime,
  cacheHitRatio,
  workerAvailable,
  componentName
}) => {
  const getPerformanceLevel = (time: number) => {
    if (time < 50) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (time < 100) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (time < 200) return { level: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(renderTime);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance - {componentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-sm">Tempo de Render</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${performance.bg} ${performance.color}`}>
            {renderTime.toFixed(1)}ms
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Cache Hit Ratio</span>
          </div>
          <Badge variant={cacheHitRatio > 0.8 ? 'default' : 'secondary'}>
            {Math.round(cacheHitRatio * 100)}%
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Web Worker</span>
          </div>
          <Badge variant={workerAvailable ? 'default' : 'destructive'}>
            {workerAvailable ? 'Disponível' : 'Indisponível'}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          Performance: {performance.level}
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceIndicator.displayName = 'PerformanceIndicator';
