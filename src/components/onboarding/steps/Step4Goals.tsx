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

export type UserType = 'entrepreneur' | 'learner';

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
  userType?: UserType;
  initialData?: Partial<GoalsFormData>;
  onDataChange: (data: Partial<GoalsFormData>) => void;
  onNext: () => void;
}

export const Step4Goals: React.FC<Step4GoalsProps> = ({
  userType = 'entrepreneur',
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

  // Objetivos diferentes baseados no userType
  const primaryGoals = userType === 'entrepreneur' ? [
    { value: "productivity", label: "Aumentar produtividade da equipe" },
    { value: "cost_reduction", label: "Reduzir custos operacionais" },
    { value: "customer_experience", label: "Melhorar experiência do cliente" },
    { value: "sales_growth", label: "Aumentar vendas e receita" },
    { value: "process_automation", label: "Automatizar processos manuais" },
    { value: "competitive_advantage", label: "Ganhar vantagem competitiva" },
    { value: "innovation", label: "Inovar produtos/serviços" },
    { value: "data_insights", label: "Obter insights dos dados" }
  ] : [
    { value: "work_efficiency", label: "Ser mais eficiente no trabalho atual" },
    { value: "personal_automation", label: "Automatizar tarefas pessoais" },
    { value: "skill_development", label: "Desenvolver novas habilidades" },
    { value: "career_change", label: "Mudar de carreira para IA" },
    { value: "practical_learning", label: "Aprender automação prática" },
    { value: "professional_growth", label: "Destacar-me profissionalmente" },
    { value: "personal_projects", label: "Criar projetos próprios" },
    { value: "data_analysis", label: "Entender análise de dados" }
  ];

  // Capacidade de investimento diferente por userType
  const investmentOptions = userType === 'entrepreneur' ? [
    { value: "minimal", label: "Mínimo - Foco em ferramentas gratuitas" },
    { value: "low", label: "Baixo - Até R$ 500/mês" },
    { value: "medium", label: "Médio - R$ 500 a R$ 2.000/mês" },
    { value: "high", label: "Alto - R$ 2.000 a R$ 10.000/mês" },
    { value: "enterprise", label: "Corporativo - Acima de R$ 10.000/mês" }
  ] : [
    { value: "free", label: "Gratuito - Apenas conteúdo free" },
    { value: "basic", label: "Básico - Até R$ 100/mês" },
    { value: "intermediate", label: "Intermediário - R$ 100-500/mês" },
    { value: "advanced", label: "Avançado - R$ 500-1.000/mês" },
    { value: "premium", label: "Premium - Acima R$ 1.000/mês" }
  ];

  // Métricas de sucesso comuns para ambos os tipos
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
           <Select 
             value={form.getValues('primary_goal')}
             onValueChange={(value) => form.setValue('primary_goal', value)}
           >
             <SelectTrigger className="h-12">
               <SelectValue placeholder="Selecione seu objetivo principal" />
             </SelectTrigger>
             <SelectContent>
               {primaryGoals.map((goal) => (
                 <SelectItem key={goal.value} value={goal.value}>
                   {goal.label}
                 </SelectItem>
               ))}
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
           <Select 
             value={form.getValues('timeline')}
             onValueChange={(value) => form.setValue('timeline', value)}
           >
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
                   checked={(form.getValues('success_metrics') || []).includes(metric)}
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
                   checked={(form.getValues('priority_areas') || []).includes(area)}
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
           <Select 
             value={form.getValues('investment_capacity')}
             onValueChange={(value) => form.setValue('investment_capacity', value)}
           >
             <SelectTrigger className="h-12">
               <SelectValue placeholder="Selecione sua capacidade de investimento" />
             </SelectTrigger>
             <SelectContent>
               {investmentOptions.map((option) => (
                 <SelectItem key={option.value} value={option.value}>
                   {option.label}
                 </SelectItem>
               ))}
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