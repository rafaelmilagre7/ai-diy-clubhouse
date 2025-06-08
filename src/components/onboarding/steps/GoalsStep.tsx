
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Target, Trophy, Calendar, TrendingUp } from 'lucide-react';

interface GoalsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

/**
 * Step de objetivos - FASE 5
 * Define metas e expectativas do usuário
 */
export const GoalsStep: React.FC<GoalsStepProps> = ({ data, onUpdate }) => {
  const handleGoalToggle = (goal: string) => {
    const current = data.shortTermGoals || [];
    const updated = current.includes(goal)
      ? current.filter((g: string) => g !== goal)
      : [...current, goal];
    
    onUpdate({
      ...data,
      shortTermGoals: updated
    });
  };

  const handleMetricToggle = (metric: string) => {
    const current = data.successMetrics || [];
    const updated = current.includes(metric)
      ? current.filter((m: string) => m !== metric)
      : [...current, metric];
    
    onUpdate({
      ...data,
      successMetrics: updated
    });
  };

  const primaryGoals = [
    { id: 'automation', label: 'Automatizar processos', description: 'Reduzir trabalho manual repetitivo' },
    { id: 'growth', label: 'Acelerar crescimento', description: 'Aumentar receita e expandir negócio' },
    { id: 'efficiency', label: 'Melhorar eficiência', description: 'Otimizar operações existentes' },
    { id: 'learning', label: 'Aprender sobre IA', description: 'Entender e dominar novas tecnologias' },
    { id: 'innovation', label: 'Inovar no mercado', description: 'Ser pioneiro em soluções inovadoras' }
  ];

  const shortTermGoals = [
    'Implementar primeira automação',
    'Reduzir tempo em tarefas manuais',
    'Melhorar atendimento ao cliente',
    'Aumentar produtividade da equipe',
    'Criar conteúdo automatizado',
    'Otimizar processos de vendas',
    'Analizar dados com IA',
    'Integrar IA nas operações'
  ];

  const successMetrics = [
    'Economia de tempo',
    'Aumento de receita',
    'Redução de custos',
    'Melhoria na satisfação do cliente',
    'Aumento da produtividade',
    'Escalabilidade dos processos',
    'Vantagem competitiva',
    'ROI das implementações'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-viverblue mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Seus Objetivos</h2>
        <p className="text-gray-600">
          Entender suas metas nos ajuda a priorizar o conteúdo mais relevante para você
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Objetivo Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Objetivo Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Qual é seu principal objetivo com IA nos próximos meses?
            </p>
            <RadioGroup 
              value={data.primaryGoal || ''} 
              onValueChange={(value) => onUpdate({ ...data, primaryGoal: value })}
            >
              {primaryGoals.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={goal.id} id={goal.id} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={goal.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {goal.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Metas de Curto Prazo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Metas de Curto Prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              O que você gostaria de alcançar nos próximos 30-90 dias?
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {shortTermGoals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={(data.shortTermGoals || []).includes(goal)}
                    onCheckedChange={() => handleGoalToggle(goal)}
                  />
                  <label
                    htmlFor={goal}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {goal}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline e Métricas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="timeline">Em quanto tempo espera ver resultados?</Label>
            <Select 
              value={data.timeline || ''} 
              onValueChange={(value) => onUpdate({ ...data, timeline: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 mês - Resultados rápidos</SelectItem>
                <SelectItem value="3months">3 meses - Implementação gradual</SelectItem>
                <SelectItem value="6months">6 meses - Transformação completa</SelectItem>
                <SelectItem value="1year">1 ano - Evolução estratégica</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Métricas de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Como você vai medir o sucesso das implementações?
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {successMetrics.map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric}
                    checked={(data.successMetrics || []).includes(metric)}
                    onCheckedChange={() => handleMetricToggle(metric)}
                  />
                  <label
                    htmlFor={metric}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {metric}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
