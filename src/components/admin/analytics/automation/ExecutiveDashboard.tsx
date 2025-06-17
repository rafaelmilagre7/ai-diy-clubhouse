
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, TrendingUp, AlertTriangle, Target, Brain, Download } from 'lucide-react';

interface ExecutiveInsight {
  type: 'strategic' | 'operational' | 'financial' | 'risk';
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  confidence: number;
}

interface ExecutiveDashboardProps {
  timeRange: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ timeRange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  const executiveInsights: ExecutiveInsight[] = [
    {
      type: 'strategic',
      title: 'Oportunidade de Expansão Identificada',
      summary: 'Análise de dados indica potencial para aumentar receita em 35% focando em automação operacional. ROI projetado de 280% em 6 meses.',
      impact: 'high',
      actionRequired: true,
      confidence: 92
    },
    {
      type: 'operational',
      title: 'Otimização de Processos Recomendada',
      summary: 'Identificados 3 gargalos principais que reduzem eficiência em 23%. Implementação de automação pode economizar 15h/semana.',
      impact: 'high',
      actionRequired: true,
      confidence: 87
    },
    {
      type: 'financial',
      title: 'Projeção de Receita Atualizada',
      summary: 'Tendência atual indica superação da meta trimestral em 12%. Receita projetada: R$ 180K vs meta R$ 160K.',
      impact: 'medium',
      actionRequired: false,
      confidence: 78
    },
    {
      type: 'risk',
      title: 'Alerta de Retenção de Usuários',
      summary: 'Modelo preditivo identifica 15% dos usuários premium em risco de churn nos próximos 30 dias. Ação preventiva recomendada.',
      impact: 'high',
      actionRequired: true,
      confidence: 84
    }
  ];

  const kpiData = {
    revenue: { current: 165000, target: 160000, growth: 12.5 },
    users: { current: 2450, target: 2200, growth: 18.2 },
    retention: { current: 87.5, target: 85, growth: 2.9 },
    efficiency: { current: 92.3, target: 90, growth: 5.1 }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strategic': return <Target className="h-5 w-5 text-purple-600" />;
      case 'operational': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'financial': return <Crown className="h-5 w-5 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Executivo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-amber-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h2>
            <p className="text-gray-600">Insights estratégicos gerados por IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório Executivo
          </Button>
        </div>
      </div>

      {/* KPIs Executivos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(kpiData.revenue.current / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-green-600">+{kpiData.revenue.growth}% vs meta</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{kpiData.users.current.toLocaleString()}</p>
                <p className="text-xs text-blue-600">+{kpiData.users.growth}% vs meta</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retenção</p>
                <p className="text-2xl font-bold text-purple-600">{kpiData.retention.current}%</p>
                <p className="text-xs text-purple-600">+{kpiData.retention.growth}% vs meta</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eficiência</p>
                <p className="text-2xl font-bold text-orange-600">{kpiData.efficiency.current}%</p>
                <p className="text-xs text-orange-600">+{kpiData.efficiency.growth}% vs meta</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Estratégicos */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Insights Estratégicos com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {executiveInsights.map((insight, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(insight.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-500 capitalize">{insight.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                    IMPACTO {insight.impact.toUpperCase()}
                  </Badge>
                  {insight.actionRequired && (
                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                      🎯 Ação Requerida
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{insight.summary}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Confiança IA:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {insight.confidence}%
                    </span>
                  </div>
                </div>
                
                {insight.actionRequired && (
                  <Button size="sm" variant="outline">
                    Ver Plano de Ação
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
