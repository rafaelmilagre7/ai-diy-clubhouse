
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Timer, CheckCircle } from 'lucide-react';

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
    if (time < 50) return { level: 'excelente', color: 'text-performance-excellent', bg: 'bg-performance-excellent/10' };
    if (time < 100) return { level: 'bom', color: 'text-performance-good', bg: 'bg-performance-good/10' };
    if (time < 200) return { level: 'regular', color: 'text-performance-fair', bg: 'bg-performance-fair/10' };
    return { level: 'lento', color: 'text-performance-poor', bg: 'bg-performance-poor/10' };
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
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Sistema</span>
          </div>
          <Badge variant="default">
            Otimizado
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
