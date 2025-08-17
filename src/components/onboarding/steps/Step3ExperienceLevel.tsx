import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Lightbulb, Rocket, Users, BookOpen, Target, Settings, Clock, Zap } from 'lucide-react';

const experienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  current_tools: z.array(z.string()).optional(),
  learning_goals: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo'),
  priority_areas: z.array(z.string()).min(1, 'Selecione pelo menos uma área'),
  implementation_timeline: z.string().min(1, 'Selecione o prazo desejado'),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface Step3ExperienceLevelProps {
  initialData?: Partial<ExperienceFormData>;
  onDataChange: (data: Partial<ExperienceFormData>) => void;
  onNext: () => void;
  userType: 'entrepreneur' | 'learner';
}

export const Step3ExperienceLevel: React.FC<Step3ExperienceLevelProps> = ({
  initialData,
  onDataChange,
  onNext,
  userType,
}) => {
  const [currentData, setCurrentData] = useState<Partial<ExperienceFormData>>(initialData || {});
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.current_tools || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialData?.learning_goals || []);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData?.priority_areas || []);

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experience_level: initialData?.experience_level || '',
      current_tools: initialData?.current_tools || [],
      learning_goals: initialData?.learning_goals || [],
      priority_areas: initialData?.priority_areas || [],
      implementation_timeline: initialData?.implementation_timeline || '',
    },
    mode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const newData = { 
      ...currentData, 
      ...watchedFields,
      current_tools: selectedTools,
      learning_goals: selectedGoals,
      priority_areas: selectedAreas
    };
    setCurrentData(newData);
    onDataChange(newData);
  }, [watchedFields, selectedTools, selectedGoals, selectedAreas]);

  const handleSubmit = useCallback((data: ExperienceFormData) => {
    if (!data.experience_level || !data.learning_goals?.length || !data.priority_areas?.length || !data.implementation_timeline) {
      return;
    }
    onNext();
  }, [onNext]);

  const handleSelectChange = useCallback((field: keyof ExperienceFormData, value: string) => {
    form.setValue(field, value);
  }, [form]);

  const getExperienceLevels = () => {
    if (userType === 'entrepreneur') {
      return [
        {
          value: 'beginner',
          label: 'Iniciante',
          description: 'Nunca usei IA no meu negócio',
          icon: <Lightbulb className="w-6 h-6 text-primary" />
        },
        {
          value: 'basic',
          label: 'Básico',
          description: 'Já experimentei algumas ferramentas de IA',
          icon: <Brain className="w-6 h-6 text-primary" />
        },
        {
          value: 'intermediate',
          label: 'Intermediário',
          description: 'Uso IA regularmente em algumas áreas',
          icon: <Rocket className="w-6 h-6 text-primary" />
        },
        {
          value: 'advanced',
          label: 'Avançado',
          description: 'IA está integrada em vários processos',
          icon: <Target className="w-6 h-6 text-primary" />
        }
      ];
    } else {
      return [
        {
          value: 'complete_beginner',
          label: 'Iniciante Completo',
          description: 'Nunca estudei ou usei IA',
          icon: <Lightbulb className="w-6 h-6 text-primary" />
        },
        {
          value: 'curious',
          label: 'Curioso',
          description: 'Sei o básico e quero aprender mais',
          icon: <Brain className="w-6 h-6 text-primary" />
        },
        {
          value: 'student',
          label: 'Estudante',
          description: 'Estou estudando IA ou áreas relacionadas',
          icon: <BookOpen className="w-6 h-6 text-primary" />
        },
        {
          value: 'professional',
          label: 'Profissional',
          description: 'Trabalho com tecnologia e quero especialização',
          icon: <Users className="w-6 h-6 text-primary" />
        }
      ];
    }
  };

  const getTitle = () => {
    return userType === 'entrepreneur' 
      ? 'Qual é sua experiência atual com IA?'
      : 'Qual é seu nível de conhecimento em IA?';
  };

  const getSubtitle = () => {
    return userType === 'entrepreneur'
      ? 'Isso nos ajudará a personalizar o conteúdo para suas necessidades empresariais'
      : 'Vamos adaptar o conteúdo para seu nível de conhecimento atual';
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <Brain className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <p className="text-muted-foreground text-lg">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Selecione a opção que melhor descreve você:
          </Label>
          <RadioGroup
            value={form.getValues('experience_level')}
            onValueChange={(value) => form.setValue('experience_level', value)}
            className="grid md:grid-cols-2 gap-4"
          >
            {getExperienceLevels().map((level) => (
              <Card 
                key={level.value} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  form.getValues('experience_level') === level.value 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => form.setValue('experience_level', level.value)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {level.icon}
                        <Label htmlFor={level.value} className="font-semibold cursor-pointer">
                          {level.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
          {form.formState.errors.experience_level && (
            <p className="text-sm text-destructive">
              {form.formState.errors.experience_level.message}
            </p>
          )}
        </div>

        {/* Ferramentas Atuais */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {userType === 'entrepreneur' 
              ? 'Quais ferramentas de IA você já usa? (opcional)'
              : 'Quais ferramentas de IA você já conhece? (opcional)'
            }
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              'ChatGPT', 'Claude', 'Gemini', 'Typebot', 'ManyChat', 'Zapier', 
              'N8N', 'Make.com', 'Notion AI', 'Midjourney', 'DALL-E', 'Runway',
              'Loom AI', 'Canva AI', 'Copy.ai', 'Jasper'
            ].map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={`tool-${tool}`}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={(checked) => {
                    const newTools = checked 
                      ? [...selectedTools, tool]
                      : selectedTools.filter(t => t !== tool);
                    setSelectedTools(newTools);
                    form.setValue('current_tools', newTools);
                  }}
                />
                <Label htmlFor={`tool-${tool}`} className="text-sm font-normal cursor-pointer">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Objetivos de Aprendizado */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {userType === 'entrepreneur'
              ? 'O que você quer alcançar com IA no seu negócio? (selecione até 3)'
              : 'Quais são seus principais objetivos? (selecione até 3)'
            }
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {(userType === 'entrepreneur' ? [
              'Automatizar processos de vendas',
              'Criar assistentes/chatbots inteligentes',
              'Gerar leads automaticamente',
              'Melhorar atendimento ao cliente',
              'Criar conteúdo (textos, imagens, vídeos)',
              'Automatizar marketing e redes sociais',
              'Desenvolver relatórios automáticos',
              'Integrar IA nos processos existentes',
              'Reduzir custos operacionais',
              'Aumentar produtividade da equipe'
            ] : [
              'Entender conceitos fundamentais de IA',
              'Aprender a usar ferramentas de IA',
              'Conseguir um emprego na área de tecnologia',
              'Criar projetos pessoais com IA',
              'Melhorar minhas habilidades profissionais',
              'Automatizar tarefas do dia a dia',
              'Desenvolver aplicações com IA',
              'Entender machine learning',
              'Criar conteúdo com IA',
              'Preparar-me para o futuro do trabalho'
            ]).map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${goal}`}
                  checked={selectedGoals.includes(goal)}
                  onCheckedChange={(checked) => {
                    const newGoals = checked 
                      ? [...selectedGoals, goal].slice(0, 3)
                      : selectedGoals.filter(g => g !== goal);
                    setSelectedGoals(newGoals);
                    form.setValue('learning_goals', newGoals);
                  }}
                />
                <Label htmlFor={`goal-${goal}`} className="text-sm font-normal cursor-pointer">
                  {goal}
                </Label>
              </div>
            ))}
          </div>
          {selectedGoals.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedGoals.length}/3 objetivos selecionados
            </p>
          )}
          {form.formState.errors.learning_goals && (
            <p className="text-sm text-destructive">
              {form.formState.errors.learning_goals.message}
            </p>
          )}
        </div>

        {/* Áreas Prioritárias */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Em quais áreas você quer focar primeiro? (selecione até 2)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {(userType === 'entrepreneur' ? [
              'Receita (vendas, leads, conversão)',
              'Operacional (processos, automação)',
              'Estratégia (planejamento, análise)',
              'Marketing (conteúdo, campanhas)',
              'Atendimento (suporte, relacionamento)',
              'Produtividade da equipe'
            ] : [
              'Conceitos fundamentais',
              'Ferramentas práticas',
              'Desenvolvimento de projetos',
              'Carreira e empregabilidade',
              'Criatividade e conteúdo',
              'Produtividade pessoal'
            ]).map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${area}`}
                  checked={selectedAreas.includes(area)}
                  onCheckedChange={(checked) => {
                    const newAreas = checked 
                      ? [...selectedAreas, area].slice(0, 2)
                      : selectedAreas.filter(a => a !== area);
                    setSelectedAreas(newAreas);
                    form.setValue('priority_areas', newAreas);
                  }}
                />
                <Label htmlFor={`area-${area}`} className="text-sm font-normal cursor-pointer">
                  {area}
                </Label>
              </div>
            ))}
          </div>
          {selectedAreas.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedAreas.length}/2 áreas selecionadas
            </p>
          )}
          {form.formState.errors.priority_areas && (
            <p className="text-sm text-destructive">
              {form.formState.errors.priority_areas.message}
            </p>
          )}
        </div>

        {/* Prazo para Implementação */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {userType === 'entrepreneur'
              ? 'Em quanto tempo você quer ver resultados práticos?'
              : 'Qual seu ritmo de aprendizado preferido?'
            }
          </Label>
          <Select 
            onValueChange={(value) => handleSelectChange('implementation_timeline', value)} 
            defaultValue={form.getValues('implementation_timeline') || ''}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              {(userType === 'entrepreneur' ? [
                { value: 'immediate', label: 'Imediatamente (já quero começar)' },
                { value: '1-month', label: 'Em até 1 mês' },
                { value: '3-months', label: 'Em até 3 meses' },
                { value: '6-months', label: 'Em até 6 meses' },
                { value: 'no-rush', label: 'Sem pressa, quero implementar devagar' }
              ] : [
                { value: 'intensive', label: 'Intensivo (várias horas por dia)' },
                { value: 'regular', label: 'Regular (1-2 horas por dia)' },
                { value: 'casual', label: 'Casual (algumas horas por semana)' },
                { value: 'slow', label: 'Devagar (no meu tempo livre)' }
              ]).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.implementation_timeline && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_timeline.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};