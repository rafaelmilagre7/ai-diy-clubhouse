
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart } from '@/components/ui/chart';
import { Brain, TrendingUp, Users, DollarSign, AlertTriangle, Target } from 'lucide-react';

interface PredictionModel {
  name: string;
  accuracy: number;
  lastTrained: string;
  status: 'active' | 'training' | 'outdated';
  predictions: number;
}

interface ChurnPrediction {
  userId: string;
  userName: string;
  churnProbability: number;
  riskFactors: string[];
  recommendedActions: string[];
  timeToChurn: string;
}

interface PredictiveAnalyticsProps {
  timeRange: string;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ timeRange }) => {
  const [activeModel, setActiveModel] = useState('churn');

  const models: PredictionModel[] = [
    {
      name: 'Churn Prediction',
      accuracy: 87.3,
      lastTrained: '2024-01-10',
      status: 'active',
      predictions: 1247
    },
    {
      name: 'Revenue Forecasting',
      accuracy: 92.1,
      lastTrained: '2024-01-12',
      status: 'active',
      predictions: 156
    },
    {
      name: 'User Lifetime Value',
      accuracy: 84.7,
      lastTrained: '2024-01-08',
      status: 'outdated',
      predictions: 2340
    },
    {
      name: 'Content Performance',
      accuracy: 79.2,
      lastTrained: '2024-01-14',
      status: 'training',
      predictions: 0
    }
  ];

  const churnPredictions: ChurnPrediction[] = [
    {
      userId: 'usr_123',
      userName: 'João Silva',
      churnProbability: 89.2,
      riskFactors: ['Baixo engajamento (7 dias sem login)', 'Implementações incompletas', 'Não acessou recursos premium'],
      recommendedActions: ['Email personalizado', 'Oferta de consultoria', 'Desconto em renovação'],
      timeToChurn: '7-10 dias'
    },
    {
      userId: 'usr_456',
      userName: 'Maria Santos',
      churnProbability: 76.5,
      riskFactors: ['Queda na frequência de uso', 'Support tickets não resolvidos', 'Avaliação baixa no NPS'],
      recommendedActions: ['Contato do Customer Success', 'Sessão de treinamento', 'Feedback survey'],
      timeToChurn: '14-21 dias'
    },
    {
      userId: 'usr_789',
      userName: 'Pedro Costa',
      churnProbability: 82.1,
      riskFactors: ['Uso apenas de features básicas', 'Não completou onboarding', 'Perfil inativo há 3 dias'],
      recommendedActions: ['Campanha de reativação', 'Demo personalizada', 'Incentivo para completar perfil'],
      timeToChurn: '5-7 dias'
    }
  ];

  // Dados de previsão de receita
  const revenueData = [
    { month: 'Jan', real: 120000, predito: 118500, confianca_min: 115000, confianca_max: 125000 },
    { month: 'Fev', real: 135000, predito: 132000, confianca_min: 128000, confianca_max: 140000 },
    { month: 'Mar', real: 142000, predito: 145000, confianca_min: 140000, confianca_max: 150000 },
    { month: 'Abr', real: null, predito: 158000, confianca_min: 152000, confianca_max: 165000 },
    { month: 'Mai', real: null, predito: 167000, confianca_min: 160000, confianca_max: 175000 },
    { month: 'Jun', real: null, predito: 181000, confianca_min: 172000, confianca_max: 190000 }
  ];

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'outdated': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (probability >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Preditivos</h2>
            <p className="text-gray-600">Inteligência artificial para previsões estratégicas</p>
          </div>
        </div>
      </div>

      {/* Status dos Modelos */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Status dos Modelos de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map((model, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{model.name}</h4>
                  <Badge className={`text-xs ${getModelStatusColor(model.status)}`}>
                    {model.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precisão:</span>
                    <span className="font-medium">{model.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Último treino:</span>
                    <span className="font-medium">{new Date(model.lastTrained).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Previsões:</span>
                    <span className="font-medium">{model.predictions.toLocaleString()}</span>
                  </div>
                </div>

                {model.status === 'outdated' && (
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Retreinar Modelo
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Previsões */}
      <Tabs defaultValue="churn" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="churn" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Usuários em Risco de Churn
              </CardTitle>
              <p className="text-sm text-gray-600">
                {churnPredictions.length} usuários identificados com alta probabilidade de cancelamento
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {churnPredictions.map((prediction, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{prediction.userName}</h4>
                      <p className="text-sm text-gray-500">ID: {prediction.userId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-sm ${getRiskColor(prediction.churnProbability)}`}>
                        {prediction.churnProbability.toFixed(1)}% Risco
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {prediction.timeToChurn}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Fatores de Risco</h5>
                      <ul className="space-y-1">
                        {prediction.riskFactors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Ações Recomendadas</h5>
                      <ul className="space-y-1">
                        {prediction.recommendedActions.map((action, idx) => (
                          <li key={idx} className="text-sm text-green-600 flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Ver Perfil Completo
                    </Button>
                    <Button size="sm">
                      Executar Campanha
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-500" />
                Previsão de Receita
              </CardTitle>
              <p className="text-sm text-gray-600">
                Modelo treinado com 92.1% de precisão • Intervalo de confiança de 95%
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <AreaChart
                  data={revenueData}
                  index="month"
                  categories={['real', 'predito', 'confianca_min', 'confianca_max']}
                  colors={['#3b82f6', '#8b5cf6', '#e5e7eb', '#e5e7eb']}
                  showLegend={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900">Próximo Mês</h4>
                  <p className="text-2xl font-bold text-green-700">R$ 158K</p>
                  <p className="text-sm text-green-600">+11.3% vs mês atual</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Trimestre</h4>
                  <p className="text-2xl font-bold text-blue-700">R$ 506K</p>
                  <p className="text-sm text-blue-600">+18.7% vs trimestre anterior</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Confiança</h4>
                  <p className="text-2xl font-bold text-purple-700">92.1%</p>
                  <p className="text-sm text-purple-600">Precisão do modelo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Customer Lifetime Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">LTV Médio</h4>
                  <p className="text-2xl font-bold text-blue-600">R$ 2.847</p>
                  <p className="text-sm text-gray-500">Por usuário</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Payback Period</h4>
                  <p className="text-2xl font-bold">4.2 meses</p>
                  <p className="text-sm text-gray-500">Tempo médio</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Churn Rate</h4>
                  <p className="text-2xl font-bold text-red-600">5.8%</p>
                  <p className="text-sm text-gray-500">Por mês</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">CLV/CAC Ratio</h4>
                  <p className="text-2xl font-bold text-green-600">3.2:1</p>
                  <p className="text-sm text-gray-500">Saudável</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-indigo-500" />
                Análise de Tendências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Tendência Principal</h4>
                  <p className="text-gray-700">
                    Crescimento acelerado em soluções de automação (45% nos últimos 3 meses).
                    Modelo prevê continuidade desta tendência por mais 6 meses.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Padrão Sazonal</h4>
                  <p className="text-gray-700">
                    Identificado padrão de aumento de 23% no engajamento às quartas-feiras.
                    Recomenda-se concentrar lançamentos neste dia.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Anomalia Detectada</h4>
                  <p className="text-gray-700">
                    Queda inesperada de 12% no uso de ferramentas de comunicação.
                    Investigação automática iniciada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
