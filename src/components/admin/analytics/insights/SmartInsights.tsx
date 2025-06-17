import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  confidence: number;
}
interface SmartInsightsProps {
  timeRange: string;
}
export const SmartInsights: React.FC<SmartInsightsProps> = ({
  timeRange
}) => {
  // Mock insights baseados em análise de dados
  const insights: Insight[] = [{
    id: '1',
    type: 'trend',
    title: 'Pico de Atividade às Quartas-feiras',
    description: 'Usuários são 35% mais ativos às quartas-feiras. Considere agendar lançamentos e comunicações neste dia.',
    impact: 'medium',
    actionable: true,
    confidence: 87
  }, {
    id: '2',
    type: 'warning',
    title: 'Taxa de Abandono em Soluções Avançadas',
    description: 'Soluções marcadas como "Avançada" têm 23% menos implementações. Revisar complexidade ou fornecer mais suporte.',
    impact: 'high',
    actionable: true,
    confidence: 92
  }, {
    id: '3',
    type: 'opportunity',
    title: 'Oportunidade em Automação Operacional',
    description: 'Soluções de categoria "Operacional" mostram maior engajamento. Expandir conteúdo nesta área pode aumentar retenção.',
    impact: 'high',
    actionable: true,
    confidence: 78
  }, {
    id: '4',
    type: 'success',
    title: 'Crescimento Consistente de Novos Usuários',
    description: 'Crescimento de 12% ao mês se mantém estável há 3 meses consecutivos.',
    impact: 'medium',
    actionable: false,
    confidence: 95
  }];
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trend':
        return <Lightbulb className="h-5 w-5 text-purple-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };
  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trend':
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };
  return <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Insights Inteligentes
        </CardTitle>
        <p className="text-sm text-gray-600">
          Análises automáticas baseadas nos seus dados dos últimos {timeRange}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map(insight => <div key={insight.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-semibold text-gray-50">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getImpactColor(insight.impact))}>
                  {insight.impact.toUpperCase()}
                </Badge>
                <Badge className={cn("text-xs", getTypeColor(insight.type))}>
                  {insight.type.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <p className="mb-3 text-gray-400">{insight.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200">Confiança:</span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{
                  width: `${insight.confidence}%`
                }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {insight.confidence}%
                  </span>
                </div>
              </div>
              
              {insight.actionable && <Badge variant="outline" className="text-xs">
                  📋 Ação Recomendada
                </Badge>}
            </div>
          </div>)}
      </CardContent>
    </Card>;
};