import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Zap, Target, CheckSquare } from 'lucide-react';

const aiExperienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  current_tools: z.array(z.string()).optional(),
  main_interest: z.string().optional(),
  implementation_status: z.string().optional(),
  desired_areas: z.array(z.string()).optional(),
  biggest_challenge: z.string().optional(),
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
  const [currentData, setCurrentData] = useState<Partial<AIExperienceFormData>>(initialData || {});

  const form = useForm<AIExperienceFormData>({
    resolver: zodResolver(aiExperienceSchema),
    defaultValues: {
      current_tools: [],
      desired_areas: [],
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

  const handleSubmit = (data: AIExperienceFormData) => {
    onNext();
  };

  const aiTools = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
    'Stable Diffusion',
    'GitHub Copilot',
    'Notion AI',
    'Jasper',
    'Copy.ai',
    'Zapier',
    'Make (Integromat)',
    'Nenhuma ainda'
  ];

  const aiAreas = [
    'Atendimento ao Cliente',
    'Marketing Digital',
    'Vendas',
    'Criação de Conteúdo',
    'Automação de Processos',
    'Análise de Dados',
    'Design e Criação',
    'Desenvolvimento',
    'Recursos Humanos',
    'Financeiro'
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Bot className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Vamos entender sua experiência atual com IA para criar o melhor plano de aprendizado
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Qual é seu nível de experiência com IA?
          </Label>
          <Select onValueChange={(value) => form.setValue('experience_level', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante - Nunca usei ferramentas de IA</SelectItem>
              <SelectItem value="basic">Básico - Uso algumas ferramentas ocasionalmente</SelectItem>
              <SelectItem value="intermediate">Intermediário - Uso IA regularmente no trabalho</SelectItem>
              <SelectItem value="advanced">Avançado - Implemento soluções de IA na empresa</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.experience_level && (
            <p className="text-sm text-destructive">
              {form.formState.errors.experience_level.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Quais ferramentas de IA você já usa? (marque todas que se aplicam)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiTools.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  onCheckedChange={(checked) => {
                    const currentTools = form.getValues('current_tools') || [];
                    if (checked) {
                      form.setValue('current_tools', [...currentTools, tool]);
                    } else {
                      form.setValue('current_tools', currentTools.filter(t => t !== tool));
                    }
                  }}
                />
                <Label htmlFor={tool} className="text-sm font-normal cursor-pointer">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Em que áreas você gostaria de implementar IA na sua empresa?
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiAreas.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={area}
                  onCheckedChange={(checked) => {
                    const currentAreas = form.getValues('desired_areas') || [];
                    if (checked) {
                      form.setValue('desired_areas', [...currentAreas, area]);
                    } else {
                      form.setValue('desired_areas', currentAreas.filter(a => a !== area));
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
            Qual é o status da implementação de IA na sua empresa?
          </Label>
          <Select onValueChange={(value) => form.setValue('implementation_status', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o status atual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Ainda não começamos</SelectItem>
              <SelectItem value="exploring">Estamos explorando possibilidades</SelectItem>
              <SelectItem value="testing">Testando algumas ferramentas</SelectItem>
              <SelectItem value="implementing">Implementando soluções</SelectItem>
              <SelectItem value="advanced">Já temos IA integrada aos processos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="biggest_challenge">
            Qual é seu maior desafio com IA atualmente? (opcional)
          </Label>
          <Textarea
            id="biggest_challenge"
            placeholder="Ex: Não sei por onde começar, falta de conhecimento técnico, resistência da equipe..."
            {...form.register('biggest_challenge')}
            className="min-h-[100px]"
          />
        </div>
      </form>
    </div>
  );
};