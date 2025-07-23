import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target, TrendingUp, Clock, Star } from 'lucide-react';

const goalsSchema = z.object({
  primary_goal: z.string().min(1, 'Selecione seu objetivo principal'),
  timeline: z.string().optional(),
  success_metrics: z.array(z.string()).optional(),
  investment_capacity: z.string().optional(),
  specific_objectives: z.string().optional(),
  priority_areas: z.array(z.string()).optional(),
});

type GoalsFormData = z.infer<typeof goalsSchema>;

interface Step4GoalsProps {
  initialData?: Partial<GoalsFormData>;
  onDataChange: (data: Partial<GoalsFormData>) => void;
  onNext: () => void;
}

export const Step4Goals: React.FC<Step4GoalsProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const [currentData, setCurrentData] = useState<Partial<GoalsFormData>>(initialData || {});

  const form = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      success_metrics: [],
      priority_areas: [],
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const newData = { ...currentData, ...watchedFields };
    setCurrentData(newData);
    onDataChange(newData);
  }, [watchedFields, onDataChange]);

  const handleSubmit = (data: GoalsFormData) => {
    onNext();
  };

  const successMetrics = [
    'Redução de custos operacionais',
    'Aumento de produtividade',
    'Melhoria na satisfação do cliente',
    'Aceleração de processos',
    'Aumento de vendas',
    'Melhoria na qualidade',
    'Redução de erros',
    'Economia de tempo'
  ];

  const priorityAreas = [
    'Automação de tarefas repetitivas',
    'Atendimento ao cliente',
    'Marketing e vendas',
    'Análise de dados',
    'Criação de conteúdo',
    'Gestão de equipes',
    'Processos financeiros',
    'Desenvolvimento de produtos'
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Target className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Defina seus objetivos para que possamos criar o melhor plano personalizado
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Qual é seu principal objetivo com IA?
          </Label>
          <Select onValueChange={(value) => form.setValue('primary_goal', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione seu objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="productivity">Aumentar produtividade da equipe</SelectItem>
              <SelectItem value="cost_reduction">Reduzir custos operacionais</SelectItem>
              <SelectItem value="customer_experience">Melhorar experiência do cliente</SelectItem>
              <SelectItem value="sales_growth">Aumentar vendas e receita</SelectItem>
              <SelectItem value="process_automation">Automatizar processos manuais</SelectItem>
              <SelectItem value="competitive_advantage">Ganhar vantagem competitiva</SelectItem>
              <SelectItem value="innovation">Inovar produtos/serviços</SelectItem>
              <SelectItem value="data_insights">Obter insights dos dados</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.primary_goal && (
            <p className="text-sm text-destructive">
              {form.formState.errors.primary_goal.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Em quanto tempo espera ver resultados?
          </Label>
          <Select onValueChange={(value) => form.setValue('timeline', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o prazo esperado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month">1 mês</SelectItem>
              <SelectItem value="3_months">3 meses</SelectItem>
              <SelectItem value="6_months">6 meses</SelectItem>
              <SelectItem value="1_year">1 ano</SelectItem>
              <SelectItem value="long_term">Longo prazo (2+ anos)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Como você vai medir o sucesso? (marque todas que se aplicam)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {successMetrics.map((metric) => (
              <div key={metric} className="flex items-center space-x-2">
                <Checkbox
                  id={metric}
                  onCheckedChange={(checked) => {
                    const currentMetrics = form.getValues('success_metrics') || [];
                    if (checked) {
                      form.setValue('success_metrics', [...currentMetrics, metric]);
                    } else {
                      form.setValue('success_metrics', currentMetrics.filter(m => m !== metric));
                    }
                  }}
                />
                <Label htmlFor={metric} className="text-sm font-normal cursor-pointer">
                  {metric}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>
            Quais áreas são prioridade para implementação?
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityAreas.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={area}
                  onCheckedChange={(checked) => {
                    const currentAreas = form.getValues('priority_areas') || [];
                    if (checked) {
                      form.setValue('priority_areas', [...currentAreas, area]);
                    } else {
                      form.setValue('priority_areas', currentAreas.filter(a => a !== area));
                    }
                  }}
                />
                <Label htmlFor={area} className="text-sm font-normal cursor-pointer">
                  {area}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Qual é sua capacidade de investimento em IA?
          </Label>
          <Select onValueChange={(value) => form.setValue('investment_capacity', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione sua capacidade de investimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Mínimo - Foco em ferramentas gratuitas</SelectItem>
              <SelectItem value="low">Baixo - Até R$ 500/mês</SelectItem>
              <SelectItem value="medium">Médio - R$ 500 a R$ 2.000/mês</SelectItem>
              <SelectItem value="high">Alto - R$ 2.000 a R$ 10.000/mês</SelectItem>
              <SelectItem value="enterprise">Corporativo - Acima de R$ 10.000/mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specific_objectives">
            Há algum objetivo específico ou desafio que gostaria de destacar? (opcional)
          </Label>
          <Textarea
            id="specific_objectives"
            placeholder="Ex: Automatizar atendimento, criar conteúdo para redes sociais, analisar dados de vendas..."
            {...form.register('specific_objectives')}
            className="min-h-[100px]"
          />
        </div>
      </form>
    </div>
  );
};