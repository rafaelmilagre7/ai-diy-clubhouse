
import React from 'react';
import { usePerformanceDashboard } from '@/hooks/usePerformanceDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const PerformanceDashboard = () => {
  const { report, isVisible, setIsVisible, resetMetrics } = usePerformanceDashboard();

  if (!import.meta.env.DEV || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md max-h-96 overflow-auto">
      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Monitor</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={resetMetrics}
                className="h-6 text-xs"
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="h-6 text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400">Ctrl+Shift+P para alternar</p>
        </CardHeader>
        
        <CardContent className="space-y-3 text-xs">
          {report && (
            <>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">Resumo</h4>
                <p>Total de eventos: {report.totalEvents}</p>
                <p>Operações lentas (&gt;1s): {report.slowOperations?.length || 0}</p>
              </div>

              {report.slowOperations?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-400 mb-1">🚨 Operações Lentas</h4>
                  <div className="space-y-1">
                    {report.slowOperations.slice(0, 5).map((op: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="truncate">{op.component}.{op.event}</span>
                        <Badge variant="destructive" className="text-xs">
                          {op.duration?.toFixed(0)}ms
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.averageByComponent && (
                <div>
                  <h4 className="font-semibold text-blue-400 mb-1">📊 Médias por Componente</h4>
                  <div className="space-y-1">
                    {Object.entries(report.averageByComponent)
                      .sort(([,a]: any, [,b]: any) => b.average - a.average)
                      .slice(0, 5)
                      .map(([component, stats]: [string, any]) => (
                        <div key={component} className="flex justify-between items-center">
                          <span className="truncate">{component}</span>
                          <div className="flex gap-1">
                            <Badge 
                              variant={stats.average > 1000 ? "destructive" : stats.average > 500 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {stats.average.toFixed(0)}ms
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {stats.callCount}x
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {report.recentEvents?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-400 mb-1">📝 Eventos Recentes</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {report.recentEvents.slice(-8).map((event: any, i: number) => (
                      <div key={i} className="text-xs text-gray-300">
                        <span className="text-gray-500">
                          {new Date(event.timestamp + performance.timeOrigin).toLocaleTimeString()}
                        </span>
                        {' '}
                        <span className="text-blue-300">{event.component}</span>
                        {' → '}
                        <span>{event.event}</span>
                        {event.duration && (
                          <Badge 
                            variant="outline" 
                            className="ml-1 text-xs h-4"
                          >
                            {event.duration.toFixed(0)}ms
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
