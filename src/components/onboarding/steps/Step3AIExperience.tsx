import React, { useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Zap } from 'lucide-react';
import { ToolSelector } from '@/components/onboarding/tools/ToolSelector';

const aiExperienceSchema = z.object({
  experience_level: z.string().min(1, 'Selecione seu nível de experiência'),
  implementation_status: z.string().min(1, 'Selecione o status da implementação'),
  implementation_approach: z.string().min(1, 'Selecione como pretende implementar'),
  current_tools: z.array(z.string()).optional(),
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

  const form = useForm<AIExperienceFormData>({
    resolver: zodResolver(aiExperienceSchema),
    defaultValues: {
      experience_level: initialData?.experience_level || '',
      implementation_status: initialData?.implementation_status || '',
      implementation_approach: initialData?.implementation_approach || '',
      current_tools: initialData?.current_tools || [],
    },
    mode: 'onChange',
  });

  console.log('[STEP3] 🚀 Renderizando com dados iniciais:', initialData);

  // Função para notificar mudanças
  const notifyDataChange = useCallback((newData: Partial<AIExperienceFormData>) => {
    console.log('[STEP3] 📊 Notificando mudança:', newData);
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
        implementation_status: data.implementation_status || '',
        implementation_approach: data.implementation_approach || '',
        current_tools: data.current_tools || []
      };
      
      console.log('[STEP3] 📝 Mudança no form detectada:', completeData);
      notifyDataChange(completeData);
    });

    return () => subscription.unsubscribe();
  }, [form, notifyDataChange]);

  const handleSelectChange = useCallback((field: keyof AIExperienceFormData, value: string) => {
    console.log('[STEP3] 🔄 Campo alterado:', field, '=', value);
    form.setValue(field, value);
  }, [form]);

  const handleToolSelectionChange = useCallback((tools: string[]) => {
    console.log('[STEP3] 🛠️ Ferramentas alteradas:', tools);
    form.setValue('current_tools', tools);
  }, [form]);

  const handleSubmit = useCallback((data: AIExperienceFormData) => {
    console.log('[STEP3] ✅ Enviando dados:', data);
    
    if (!data.experience_level || !data.implementation_status || !data.implementation_approach) {
      console.error('[STEP3] ❌ Campos obrigatórios não preenchidos');
      return;
    }
    
    onNext();
  }, [onNext]);

  const isFormValid = form.formState.isValid && 
    form.getValues('experience_level') && 
    form.getValues('implementation_status') && 
    form.getValues('implementation_approach');

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

        {/* Status de Implementação */}
        <div className="space-y-2">
          <Label>
            Qual é o status da implementação de IA na sua empresa?
          </Label>
          <Select 
            onValueChange={(value) => handleSelectChange('implementation_status', value)} 
            defaultValue={form.getValues('implementation_status') || ''}
          >
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
          {form.formState.errors.implementation_status && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_status.message}
            </p>
          )}
        </div>

        {/* Abordagem de Implementação */}
        <div className="space-y-2">
          <Label>
            Como pretende implementar IA na sua empresa?
          </Label>
          <Select 
            onValueChange={(value) => handleSelectChange('implementation_approach', value)} 
            defaultValue={form.getValues('implementation_approach') || ''}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione sua abordagem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">Eu mesmo vou fazer</SelectItem>
              <SelectItem value="team">Meu time</SelectItem>
              <SelectItem value="hire">Quero contratar</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.implementation_approach && (
            <p className="text-sm text-destructive">
              {form.formState.errors.implementation_approach.message}
            </p>
          )}
        </div>

        {/* Seletor de Ferramentas */}
        <ToolSelector
          initialTools={initialData?.current_tools}
          onSelectionChange={handleToolSelectionChange}
        />

        {/* Botão de Continuar */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90"
            disabled={!isFormValid}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};