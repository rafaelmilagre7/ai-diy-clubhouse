import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3, Users, Target } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useTrendAnalysisData } from '@/hooks/analytics/insights/useTrendAnalysisData';

interface TrendAnalysisProps {
  timeRange: string;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ timeRange }) => {
  const { data: trends, isLoading, error } = useTrendAnalysisData(timeRange);

  if (isLoading) {
    return <LoadingScreen variant="modern" type="chart" fullScreen={false} />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Erro ao carregar dados de tendências</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Dados insuficientes para análise de tendências</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'Usuários Ativos':
        return <Users className="h-4 w-4" />;
      case 'Implementações':
        return <BarChart3 className="h-4 w-4" />;
      case 'Taxa de Conclusão':
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatValue = (metric: string, value: number) => {
    if (metric === 'Taxa de Conclusão') {
      return `${value.toFixed(1)}%`;
    }
    return Math.round(value).toString();
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          Análise de Tendências
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comparação com período anterior ({timeRange})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {trends.map((trend, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                {getMetricIcon(trend.metric)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{trend.metric}</p>
                <p className="text-sm text-gray-600">
                  Atual: {formatValue(trend.metric, trend.current)}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendColor(trend.trend)}`}>
              {getTrendIcon(trend.trend)}
              <span className="text-sm font-medium">
                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
