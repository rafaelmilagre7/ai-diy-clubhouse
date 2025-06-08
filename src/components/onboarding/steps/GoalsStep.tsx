
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Calendar, TrendingUp } from 'lucide-react';

interface GoalsStepProps {
  onDataChange: (data: any) => void;
  data?: any;
}

/**
 * Step de objetivos e metas do usuário
 * FASE 3: Definição de objetivos e timeline
 */
export const GoalsStep: React.FC<GoalsStepProps> = ({ onDataChange, data = {} }) => {
  const shortTermGoals = [
    { id: 'automate_tasks', label: 'Automatizar tarefas repetitivas' },
    { id: 'improve_content', label: 'Melhorar criação de conteúdo' },
    { id: 'data_analysis', label: 'Analisar dados com mais eficiência' },
    { id: 'team_productivity', label: 'Aumentar produtividade da equipe' },
    { id: 'learn_tools', label: 'Dominar novas ferramentas de IA' },
    { id: 'cost_reduction', label: 'Reduzir custos operacionais' },
    { id: 'customer_service', label: 'Melhorar atendimento ao cliente' },
    { id: 'competitive_edge', label: 'Ganhar vantagem competitiva' }
  ];

  const successMetrics = [
    { id: 'time_saved', label: 'Tempo economizado por semana' },
    { id: 'revenue_increase', label: 'Aumento de receita' },
    { id: 'cost_savings', label: 'Redução de custos' },
    { id: 'team_efficiency', label: 'Melhoria na eficiência da equipe' },
    { id: 'customer_satisfaction', label: 'Satisfação do cliente' },
    { id: 'process_automation', label: 'Processos automatizados' },
    { id: 'content_quality', label: 'Qualidade do conteúdo' },
    { id: 'decision_speed', label: 'Velocidade de tomada de decisões' }
  ];

  const updatePrimaryGoal = (value: string) => {
    onDataChange({
      ...data,
      primaryGoal: value
    });
  };

  const updateShortTermGoals = (goalId: string, checked: boolean) => {
    const currentGoals = data.shortTermGoals || [];
    const newGoals = checked
      ? [...currentGoals, goalId]
      : currentGoals.filter((id: string) => id !== goalId);
    
    onDataChange({
      ...data,
      shortTermGoals: newGoals
    });
  };

  const updateTimeline = (value: string) => {
    onDataChange({
      ...data,
      timeline: value
    });
  };

  const updateSuccessMetrics = (metricId: string, checked: boolean) => {
    const currentMetrics = data.successMetrics || [];
    const newMetrics = checked
      ? [...currentMetrics, metricId]
      : currentMetrics.filter((id: string) => id !== metricId);
    
    onDataChange({
      ...data,
      successMetrics: newMetrics
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Seus Objetivos</h2>
        <p className="text-gray-600">
          Vamos definir suas metas para personalizar sua jornada
        </p>
      </div>

      <div className="space-y-6">
        {/* Objetivo Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-viverblue" />
              Objetivo Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Qual é seu principal objetivo ao usar IA no seu trabalho/negócio?
            </p>
            <RadioGroup value={data.primaryGoal || ''} onValueChange={updatePrimaryGoal}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automation" id="automation" />
                <Label htmlFor="automation">Automação - Automatizar processos e tarefas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="growth" id="growth" />
                <Label htmlFor="growth">Crescimento - Escalar o negócio mais rapidamente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efficiency" id="efficiency" />
                <Label htmlFor="efficiency">Eficiência - Otimizar recursos e tempo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="learning" id="learning" />
                <Label htmlFor="learning">Aprendizado - Desenvolver habilidades em IA</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="innovation" id="innovation" />
                <Label htmlFor="innovation">Inovação - Criar soluções diferenciadas</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Objetivos de Curto Prazo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              Objetivos de Curto Prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              O que você gostaria de alcançar nos próximos meses? (pode selecionar várias opções)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortTermGoals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal.id}
                    checked={(data.shortTermGoals || []).includes(goal.id)}
                    onCheckedChange={(checked) => updateShortTermGoals(goal.id, checked as boolean)}
                  />
                  <Label htmlFor={goal.id} className="text-sm font-normal">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-viverblue" />
              Prazo para Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Em quanto tempo você espera ver os primeiros resultados significativos?
            </p>
            <RadioGroup value={data.timeline || ''} onValueChange={updateTimeline}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1month" id="1month" />
                <Label htmlFor="1month">1 mês - Resultados rápidos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3months" id="3months" />
                <Label htmlFor="3months">3 meses - Implementação gradual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6months" id="6months" />
                <Label htmlFor="6months">6 meses - Transformação estrutural</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1year" id="1year" />
                <Label htmlFor="1year">1 ano - Mudança organizacional</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Métricas de Sucesso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              Como Medir o Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Quais métricas são mais importantes para você acompanhar?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {successMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={(data.successMetrics || []).includes(metric.id)}
                    onCheckedChange={(checked) => updateSuccessMetrics(metric.id, checked as boolean)}
                  />
                  <Label htmlFor={metric.id} className="text-sm font-normal">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
