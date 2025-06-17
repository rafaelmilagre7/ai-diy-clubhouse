
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Zap, Clock, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  category: 'content' | 'marketing' | 'product' | 'operations' | 'user-experience';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  estimatedEffort: string;
  timeToImplement: string;
  confidence: number;
  potentialRoi: number;
  status: 'new' | 'in-progress' | 'completed' | 'dismissed';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
}

interface AutoRecommendationsProps {
  timeRange: string;
}

export const AutoRecommendations: React.FC<AutoRecommendationsProps> = ({ timeRange }) => {
  const [filter, setFilter] = useState<'all' | 'high-impact' | 'quick-wins' | 'automated'>('all');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      category: 'content',
      priority: 'critical',
      title: 'Otimizar Conteúdo de Soluções Avançadas',
      description: 'Análise indica que soluções marcadas como "Avançada" têm 23% menos engajamento. Recomenda-se simplificar linguagem e adicionar mais exemplos práticos.',
      expectedImpact: 'Aumento de 15-20% na conclusão de implementações',
      estimatedEffort: '8-12 horas de trabalho',
      timeToImplement: '1-2 semanas',
      confidence: 92,
      potentialRoi: 280,
      status: 'new',
      automationLevel: 'semi-automated'
    },
    {
      id: '2',
      category: 'marketing',
      priority: 'high',
      title: 'Campanha de Reengajamento Personalizada',
      description: 'Modelo preditivo identifica 147 usuários em risco de churn. Recomenda-se campanha personalizada baseada em comportamento histórico.',
      expectedImpact: 'Retenção de 60-70% dos usuários em risco',
      estimatedEffort: '4-6 horas para configuração',
      timeToImplement: '3-5 dias',
      confidence: 87,
      potentialRoi: 450,
      status: 'new',
      automationLevel: 'fully-automated'
    },
    {
      id: '3',
      category: 'product',
      priority: 'high',
      title: 'Implementar Onboarding Adaptativo',
      description: 'Usuários com onboarding personalizado têm 35% mais probabilidade de completar primeira implementação. Sistema pode adaptar baseado no perfil.',
      expectedImpact: 'Melhoria de 25-30% na taxa de ativação',
      estimatedEffort: '16-20 horas de desenvolvimento',
      timeToImplement: '2-3 semanas',
      confidence: 78,
      potentialRoi: 320,
      status: 'in-progress',
      automationLevel: 'manual'
    },
    {
      id: '4',
      category: 'operations',
      priority: 'medium',
      title: 'Automatizar Relatórios de Performance',
      description: 'Relatórios manuais consomem 6h/semana. Sistema pode gerar automaticamente com insights personalizados por stakeholder.',
      expectedImpact: 'Economia de 24h/mês e insights mais precisos',
      estimatedEffort: '12-16 horas para setup inicial',
      timeToImplement: '1-2 semanas',
      confidence: 95,
      potentialRoi: 180,
      status: 'new',
      automationLevel: 'fully-automated'
    }
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return '📝';
      case 'marketing': return '📢';
      case 'product': return '🚀';
      case 'operations': return '⚙️';
      case 'user-experience': return '👤';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAutomationColor = (level: string) => {
    switch (level) {
      case 'fully-automated': return 'bg-green-100 text-green-800 border-green-200';
      case 'semi-automated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manual': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    switch (filter) {
      case 'high-impact': return rec.potentialRoi >= 300;
      case 'quick-wins': return rec.estimatedEffort.includes('4-6') || rec.estimatedEffort.includes('8-12');
      case 'automated': return rec.automationLevel === 'fully-automated';
      default: return true;
    }
  });

  const updateStatus = (id: string, newStatus: Recommendation['status']) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec)
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Recomendações Automáticas
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'high-impact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('high-impact')}
            >
              Alto Impacto
            </Button>
            <Button
              variant={filter === 'quick-wins' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('quick-wins')}
            >
              Vitórias Rápidas
            </Button>
            <Button
              variant={filter === 'automated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('automated')}
            >
              Automáticas
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Sistema de IA analisou {recommendations.length} oportunidades de otimização
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(recommendation.category)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {recommendation.category.replace('-', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getPriorityColor(recommendation.priority))}>
                  {recommendation.priority.toUpperCase()}
                </Badge>
                <Badge className={cn("text-xs", getAutomationColor(recommendation.automationLevel))}>
                  {recommendation.automationLevel === 'fully-automated' ? '🤖 AUTO' : 
                   recommendation.automationLevel === 'semi-automated' ? '⚡ SEMI' : '👤 MANUAL'}
                </Badge>
                <Badge className={cn("text-xs", getStatusColor(recommendation.status))}>
                  {recommendation.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{recommendation.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-900 mb-1">Impacto Esperado</h5>
                <p className="text-sm text-green-700">{recommendation.expectedImpact}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-1">Esforço Estimado</h5>
                <p className="text-sm text-blue-700">{recommendation.estimatedEffort}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-900 mb-1">Tempo de Implementação</h5>
                <p className="text-sm text-purple-700">{recommendation.timeToImplement}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Confiança:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${recommendation.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {recommendation.confidence}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    ROI: {recommendation.potentialRoi}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {recommendation.status === 'new' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(recommendation.id, 'dismissed')}
                    >
                      Dispensar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(recommendation.id, 'in-progress')}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Implementar
                    </Button>
                  </>
                )}
                {recommendation.status === 'in-progress' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(recommendation.id, 'completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Concluído
                  </Button>
                )}
                {recommendation.status === 'completed' && (
                  <Badge className="bg-green-100 text-green-800">
                    ✅ Implementado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
