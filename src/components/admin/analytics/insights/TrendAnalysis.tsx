import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart } from '@/components/ui/chart';
import { TrendingUp, Calendar, Target, AlertTriangle } from 'lucide-react';
interface Prediction {
  metric: string;
  currentValue: number;
  predicted30d: number;
  predicted90d: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'medium' | 'high';
}
interface TrendAnalysisProps {
  timeRange: string;
}
export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  timeRange
}) => {
  const predictions: Prediction[] = [{
    metric: 'Novos Usuários',
    currentValue: 45,
    predicted30d: 52,
    predicted90d: 58,
    confidence: 87,
    trend: 'up',
    risk: 'low'
  }, {
    metric: 'Taxa de Conclusão',
    currentValue: 68,
    predicted30d: 65,
    predicted90d: 62,
    confidence: 73,
    trend: 'down',
    risk: 'medium'
  }, {
    metric: 'Receita Estimada (R$)',
    currentValue: 45000,
    predicted30d: 48500,
    predicted90d: 54000,
    confidence: 82,
    trend: 'up',
    risk: 'low'
  }];

  // Dados simulados para o gráfico de tendência
  const trendData = [{
    month: 'Jan',
    usuarios: 120,
    implementacoes: 85,
    receita: 38000
  }, {
    month: 'Fev',
    usuarios: 135,
    implementacoes: 92,
    receita: 41000
  }, {
    month: 'Mar',
    usuarios: 142,
    implementacoes: 88,
    receita: 43500
  }, {
    month: 'Abr',
    usuarios: 158,
    implementacoes: 95,
    receita: 45000
  }, {
    month: 'Mai',
    usuarios: 165,
    implementacoes: 102,
    receita: 48500
  }, {
    month: 'Jun',
    usuarios: 172,
    implementacoes: 98,
    receita: 52000
  }];
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
  return <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
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
        <div className="h-64">
          <h4 className="font-semibold text-gray-900 mb-3">Tendência dos Últimos 6 Meses</h4>
          <AreaChart data={trendData} index="month" categories={['usuarios', 'implementacoes']} colors={['#3b82f6', '#8b5cf6']} showLegend={true} />
        </div>

        {/* Previsões */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Previsões</h4>
          {predictions.map((prediction, index) => <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-gray-50">{prediction.metric}</h5>
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
                  <span className="font-semibold text-zinc-50">
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
            </div>)}
        </div>

        {/* Alertas Antecipados */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-orange-900">Alertas Antecipados</h4>
          </div>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Taxa de conclusão pode cair para 62% em 90 dias se não houver intervenção</li>
            <li>• Crescimento de usuários está acelerando - preparar infraestrutura</li>
            <li>• Receita projetada para crescer 20% - oportunidade de expansão</li>
          </ul>
        </div>
      </CardContent>
    </Card>;
};