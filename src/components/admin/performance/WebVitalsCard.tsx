
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge, Clock, Eye, Zap, Wifi } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
  icon: React.ReactNode;
  description: string;
}

export const WebVitalsCard: React.FC = () => {
  const { getMetrics } = usePerformanceMonitor();
  const [webVitals, setWebVitals] = useState<WebVitalMetric[]>([]);

  useEffect(() => {
    const updateWebVitals = () => {
      const metrics = getMetrics();
      const webVitalMetrics = metrics.filter(m => m.context === 'web_vitals');

      // Obter último valor de cada métrica
      const latestMetrics = webVitalMetrics.reduce((acc, metric) => {
        const name = metric.name.replace('web_vital_', '').toUpperCase();
        if (!acc[name] || metric.timestamp > acc[name].timestamp) {
          acc[name] = metric;
        }
        return acc;
      }, {} as Record<string, any>);

      const vitalsConfig = [
        {
          name: 'LCP',
          threshold: { good: 2500, poor: 4000 },
          icon: <Eye className="w-5 h-5" />,
          description: 'Largest Contentful Paint - Tempo para o maior elemento ser renderizado'
        },
        {
          name: 'FID',
          threshold: { good: 100, poor: 300 },
          icon: <Zap className="w-5 h-5" />,
          description: 'First Input Delay - Tempo de resposta da primeira interação'
        },
        {
          name: 'CLS',
          threshold: { good: 0.1, poor: 0.25 },
          icon: <Gauge className="w-5 h-5" />,
          description: 'Cumulative Layout Shift - Estabilidade visual da página'
        },
        {
          name: 'FCP',
          threshold: { good: 1800, poor: 3000 },
          icon: <Clock className="w-5 h-5" />,
          description: 'First Contentful Paint - Tempo para o primeiro conteúdo aparecer'
        },
        {
          name: 'TTFB',
          threshold: { good: 800, poor: 1800 },
          icon: <Wifi className="w-5 h-5" />,
          description: 'Time to First Byte - Tempo de resposta do servidor'
        }
      ];

      const vitals = vitalsConfig.map(config => {
        const metric = latestMetrics[config.name];
        const value = metric?.value || 0;
        
        let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
        if (value > config.threshold.poor) {
          rating = 'poor';
        } else if (value > config.threshold.good) {
          rating = 'needs-improvement';
        }

        return {
          name: config.name,
          value,
          rating,
          threshold: config.threshold,
          icon: config.icon,
          description: config.description
        };
      });

      setWebVitals(vitals);
    };

    updateWebVitals();
    const interval = setInterval(updateWebVitals, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [getMetrics]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'good': return 'Bom';
      case 'needs-improvement': return 'Precisa Melhorar';
      case 'poor': return 'Ruim';
      default: return 'N/A';
    }
  };

  const getProgressValue = (value: number, threshold: { good: number; poor: number }) => {
    if (value <= threshold.good) return 100;
    if (value <= threshold.poor) return 70;
    return 30;
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {webVitals.map((vital) => (
        <Card key={vital.name} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {vital.icon}
                <CardTitle className="text-lg">{vital.name}</CardTitle>
              </div>
              <Badge className={getRatingColor(vital.rating)}>
                {getRatingText(vital.rating)}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {vital.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Valor atual */}
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {vital.value > 0 ? formatValue(vital.name, vital.value) : 'N/A'}
                </div>
                {vital.value > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Valor atual
                  </div>
                )}
              </div>

              {/* Barra de progresso */}
              {vital.value > 0 && (
                <div className="space-y-2">
                  <Progress 
                    value={getProgressValue(vital.value, vital.threshold)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Bom: ≤{formatValue(vital.name, vital.threshold.good)}</span>
                    <span>Ruim: >{formatValue(vital.name, vital.threshold.poor)}</span>
                  </div>
                </div>
              )}

              {/* Status */}
              {vital.value === 0 && (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Aguardando dados...</p>
                  <p className="text-xs">
                    Navegue pela aplicação para coletar métricas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Card de resumo */}
      <Card className="lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Resumo das Web Vitals</CardTitle>
          <CardDescription>
            Status geral da performance baseado nas Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {webVitals.filter(v => v.rating === 'good' && v.value > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Boas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {webVitals.filter(v => v.rating === 'needs-improvement' && v.value > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Precisam Melhorar</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {webVitals.filter(v => v.rating === 'poor' && v.value > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Ruins</div>
            </div>
          </div>
          
          {webVitals.every(v => v.value === 0) && (
            <div className="text-center mt-4 p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Nenhuma métrica coletada ainda. Use a aplicação para gerar dados de performance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebVitalsCard;
