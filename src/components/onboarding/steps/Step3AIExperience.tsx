import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Zap, Target, Clock, Settings } from 'lucide-react';

const aiExperienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  current_tools: z.array(z.string()).optional(), // Ferramentas atuais
  learning_goals: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo'),
  priority_areas: z.array(z.string()).min(1, 'Selecione pelo menos uma área'),
  implementation_timeline: z.string().min(1, 'Selecione o prazo desejado'),
});

type AIExperienceFormData = z.infer<typeof aiExperienceSchema>;

interface Step3AIExperienceProps {
  initialData?: Partial<AIExperienceFormData>;
  onDataChange: (data: Partial<AIExperienceFormData>) => void;
  onNext: () => void;
}

export const Step3AIExperience: React.FC<Step3AIExperienceProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const onDataChangeRef = useRef(onDataChange);
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.current_tools || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialData?.learning_goals || []);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData?.priority_areas || []);

  const form = useForm<AIExperienceFormData>({
    resolver: zodResolver(aiExperienceSchema),
    defaultValues: {
      experience_level: initialData?.experience_level || '',
      current_tools: initialData?.current_tools || [],
      learning_goals: initialData?.learning_goals || [],
      priority_areas: initialData?.priority_areas || [],
      implementation_timeline: initialData?.implementation_timeline || '',
    },
    mode: 'onChange',
  });

  // Função para notificar mudanças
  const notifyDataChange = useCallback((newData: Partial<AIExperienceFormData>) => {
    onDataChangeRef.current(newData);
  }, []);

  // Atualizar referência quando onDataChange mudar
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Observar mudanças no formulário
  useEffect(() => {
    const subscription = form.watch((data) => {
      const completeData = {
        experience_level: data.experience_level || '',
        current_tools: data.current_tools || [],
        learning_goals: data.learning_goals || [],
        priority_areas: data.priority_areas || [],
        implementation_timeline: data.implementation_timeline || '',
      };
      
      notifyDataChange(completeData);
    });

    return () => subscription.unsubscribe();
  }, [form, notifyDataChange]);

  const handleSelectChange = useCallback((field: keyof AIExperienceFormData, value: string) => {
    form.setValue(field, value);
  }, [form]);

  const handleSubmit = useCallback((data: AIExperienceFormData) => {
    
    if (!data.experience_level || !data.learning_goals?.length || !data.priority_areas?.length || !data.implementation_timeline) {
      console.error('[STEP3] ❌ Campos obrigatórios não preenchidos');
      return;
    }
    
    onNext();
  }, [onNext]);

  const isFormValid = form.formState.isValid && 
    form.getValues('experience_level') && 
    form.getValues('learning_goals')?.length > 0 && 
    form.getValues('priority_areas')?.length > 0 &&
    form.getValues('implementation_timeline');

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Bot className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Vamos entender sua experiência atual com IA para criar o melhor plano de aprendizado
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nível de Experiência */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Qual é seu nível de experiência com IA?
          </Label>
          <Select 
            onValueChange={(value) => handleSelectChange('experience_level', value)} 
            defaultValue={form.getValues('experience_level') || ''}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante - Nunca usei ferramentas de IA</SelectItem>
              <SelectItem value="basic">Básico - Uso ChatGPT e algumas ferramentas simples</SelectItem>
              <SelectItem value="intermediate">Intermediário - Uso IA regularmente no trabalho</SelectItem>
              <SelectItem value="advanced">Avançado - Implemento e automatizo com IA</SelectItem>
            </SelectContent>
          </Select>
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
            Quais ferramentas de IA você já usa? (opcional)
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
            Quais são seus principais objetivos? (selecione até 3)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              'Automatizar processos de vendas',
              'Criar assistentes/chatbots inteligentes',
              'Gerar leads automaticamente',
              'Melhorar atendimento ao cliente',
              'Criar conteúdo (textos, imagens, vídeos)',
              'Automatizar marketing e redes sociais',
              'Desenvolver relatórios automáticos',
              'Integrar IA nos processos existentes',
              'Criar ferramentas personalizadas',
              'Aprender programação com IA'
            ].map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${goal}`}
                  checked={selectedGoals.includes(goal)}
                  onCheckedChange={(checked) => {
                    const newGoals = checked 
                      ? [...selectedGoals, goal].slice(0, 3) // Máximo 3
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
        </div>

        {/* Áreas Prioritárias */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Em quais áreas você quer focar primeiro? (selecione até 2)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              'Receita (vendas, leads, conversão)',
              'Operacional (processos, automação)',
              'Estratégia (planejamento, análise)',
              'Marketing (conteúdo, campanhas)',
              'Atendimento (suporte, relacionamento)',
              'Produtividade pessoal'
            ].map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${area}`}
                  checked={selectedAreas.includes(area)}
                  onCheckedChange={(checked) => {
                    const newAreas = checked 
                      ? [...selectedAreas, area].slice(0, 2) // Máximo 2
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
        </div>

        {/* Prazo para Implementação */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Em quanto tempo você gostaria de ver resultados práticos?
          </Label>
          <Select 
            onValueChange={(value) => handleSelectChange('implementation_timeline', value)} 
            defaultValue={form.getValues('implementation_timeline') || ''}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Imediatamente (já quero começar)</SelectItem>
              <SelectItem value="1-month">Em até 1 mês</SelectItem>
              <SelectItem value="3-months">Em até 3 meses</SelectItem>
              <SelectItem value="6-months">Em até 6 meses</SelectItem>
              <SelectItem value="no-rush">Sem pressa, quero aprender devagar</SelectItem>
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