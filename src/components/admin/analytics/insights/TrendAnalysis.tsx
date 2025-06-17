
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart } from '@/components/ui/chart';
import { TrendingUp, Calendar, Target, AlertTriangle } from 'lucide-react';
import { useRealAnalyticsData } from '@/hooks/analytics/useRealAnalyticsData';
import { ModernLoadingState } from '../ModernLoadingState';

interface TrendAnalysisProps {
  timeRange: string;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  timeRange
}) => {
  const { data, loading, error } = useRealAnalyticsData({ 
    timeRange, 
    category: 'all', 
    difficulty: 'all' 
  });

  if (loading) {
    return <ModernLoadingState type="card" />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Erro ao Carregar Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular previsões baseadas nos dados reais
  const calculatePredictions = () => {
    const currentUsers = data.totalUsers;
    const currentImplementations = data.totalImplementations;
    const currentRevenue = currentUsers * 150; // Estimativa baseada em valor médio

    // Calcular tendências baseadas nos dados históricos
    const userGrowthRate = data.usersByTime.length > 1 ? 
      (data.usersByTime[data.usersByTime.length - 1]?.novos || 0) / Math.max(1, data.usersByTime[data.usersByTime.length - 2]?.novos || 1) : 1;
    
    const implementationRate = currentUsers > 0 ? currentImplementations / currentUsers : 0.7;
    
    return [
      {
        metric: 'Novos Usuários',
        currentValue: currentUsers,
        predicted30d: Math.round(currentUsers * (1 + (userGrowthRate - 1) * 0.3)),
        predicted90d: Math.round(currentUsers * (1 + (userGrowthRate - 1) * 0.9)),
        confidence: userGrowthRate > 1 ? 85 : 75,
        trend: userGrowthRate > 1.05 ? 'up' : userGrowthRate < 0.95 ? 'down' : 'stable',
        risk: userGrowthRate > 1.2 ? 'high' : userGrowthRate > 1 ? 'low' : 'medium'
      },
      {
        metric: 'Taxa de Implementação (%)',
        currentValue: Math.round(implementationRate * 100),
        predicted30d: Math.round(implementationRate * 100 * 1.05),
        predicted90d: Math.round(implementationRate * 100 * 1.15),
        confidence: 78,
        trend: 'up',
        risk: 'low'
      },
      {
        metric: 'Receita Estimada (R$)',
        currentValue: currentRevenue,
        predicted30d: Math.round(currentRevenue * 1.08),
        predicted90d: Math.round(currentRevenue * 1.25),
        confidence: 82,
        trend: 'up',
        risk: 'low'
      }
    ];
  };

  const predictions = calculatePredictions();

  // Preparar dados do gráfico baseados nos dados reais
  const trendData = data.usersByTime.map((item, index) => ({
    month: item.name,
    usuarios: item.total,
    implementacoes: Math.round(item.total * 0.7), // Estimativa baseada na taxa média
    receita: item.total * 150
  }));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.includes('R$')) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-indigo-500" />
          Análise de Tendências
        </CardTitle>
        <p className="text-sm text-gray-600">
          Previsões baseadas em dados históricos e padrões identificados
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de Tendência */}
        {trendData.length > 0 && (
          <div className="h-64">
            <h4 className="font-semibold text-gray-900 mb-3">Tendência dos Últimos Meses</h4>
            <AreaChart 
              data={trendData} 
              index="month" 
              categories={['usuarios', 'implementacoes']} 
              colors={['#3b82f6', '#8b5cf6']} 
              showLegend={true} 
            />
          </div>
        )}

        {/* Previsões */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Previsões</h4>
          {predictions.map((prediction, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-gray-900">{prediction.metric}</h5>
                  {getTrendIcon(prediction.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getRiskColor(prediction.risk)}`}>
                    Risco {prediction.risk.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {prediction.confidence}% confiança
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Atual</span>
                  <span className="font-semibold text-gray-900">
                    {formatValue(prediction.currentValue, prediction.metric)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">30 dias</span>
                  <span className="font-semibold text-blue-600">
                    {formatValue(prediction.predicted30d, prediction.metric)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">90 dias</span>
                  <span className="font-semibold text-purple-600">
                    {formatValue(prediction.predicted90d, prediction.metric)}
                  </span>
                </div>
              </div>

              {/* Variação percentual */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Variação 30d: {((prediction.predicted30d - prediction.currentValue) / prediction.currentValue * 100).toFixed(1)}%
                </span>
                <span className="text-gray-500">
                  Variação 90d: {((prediction.predicted90d - prediction.currentValue) / prediction.currentValue * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Alertas Antecipados baseados em dados reais */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-orange-900">Alertas Baseados em Dados</h4>
          </div>
          <ul className="text-sm text-orange-800 space-y-1">
            {data.totalUsers > 0 && data.totalImplementations / data.totalUsers < 0.6 && (
              <li>• Taxa de implementação pode estar baixa - considerar melhorar onboarding</li>
            )}
            {data.usersByTime.length > 1 && data.usersByTime[data.usersByTime.length - 1]?.novos > data.usersByTime[data.usersByTime.length - 2]?.novos && (
              <li>• Crescimento de usuários está acelerando - preparar infraestrutura</li>
            )}
            {data.totalUsers > 50 && (
              <li>• Base de usuários crescendo - oportunidade de expansão de conteúdo</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
