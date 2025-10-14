import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Target, Award } from 'lucide-react';
import { NetworkingAnalytics } from '@/hooks/networking/useNetworkingAnalytics';

interface ROIMetricsProps {
  analytics: NetworkingAnalytics;
}

export const ROIMetrics: React.FC<ROIMetricsProps> = ({ analytics }) => {
  const avgValuePerConnection = analytics.totalConnections > 0
    ? analytics.estimatedValue / analytics.totalConnections
    : 0;

  const metrics = [
    {
      label: 'Valor Total Gerado',
      value: `R$ ${(analytics.estimatedValue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      trend: '+32%'
    },
    {
      label: 'Valor por Conexão',
      value: `R$ ${(avgValuePerConnection / 1000).toFixed(1)}k`,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '+18%'
    },
    {
      label: 'Taxa de Conversão',
      value: '68%',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      trend: '+12%'
    },
    {
      label: 'Score de Qualidade',
      value: '94/100',
      icon: Award,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      trend: '+8%'
    }
  ];

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          ROI & Performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Métricas de retorno e qualidade
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <div 
              key={metric.label}
              className="relative overflow-hidden rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                  {metric.trend}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
