
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { ModernLoadingState } from '../ModernLoadingState';

interface TrendAnalysisProps {
  timeRange: string;
}

interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ timeRange }) => {
  const [loading, setLoading] = React.useState(true);
  const [trends, setTrends] = React.useState<TrendData[]>([]);

  React.useEffect(() => {
    // Simular carregamento de dados reais
    const loadTrendData = async () => {
      setLoading(true);
      
      // Aqui você conectaria com dados reais do Supabase
      // Por enquanto, usando dados mockados que parecem reais
      const mockTrends: TrendData[] = [
        {
          metric: 'Usuários Ativos',
          current: 142,
          previous: 128,
          change: 10.9,
          trend: 'up',
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          metric: 'Implementações',
          current: 23,
          previous: 27,
          change: -14.8,
          trend: 'down',
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          metric: 'Taxa de Conclusão',
          current: 76.5,
          previous: 76.2,
          change: 0.4,
          trend: 'stable',
          icon: <Minus className="h-4 w-4" />
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrends(mockTrends);
      setLoading(false);
    };

    loadTrendData();
  }, [timeRange]);

  if (loading) {
    return <ModernLoadingState type="chart" />;
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
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                {trend.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{trend.metric}</p>
                <p className="text-sm text-gray-600">
                  Atual: {typeof trend.current === 'number' && trend.current % 1 !== 0 
                    ? trend.current.toFixed(1) 
                    : trend.current}
                  {trend.metric.includes('Taxa') ? '%' : ''}
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
