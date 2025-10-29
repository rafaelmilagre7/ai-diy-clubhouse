
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BasicInfo } from './components/BasicInfo';
import { TagManager } from './components/TagManager';
import { VideoTutorials } from './components/VideoTutorials';
import { MemberBenefit } from './components/MemberBenefit';
import { toolFormSchema } from './schema/toolFormSchema';
import { ToolFormProps, ToolFormValues } from './types/toolFormTypes';
import { BenefitType } from '@/types/toolTypes';
import { useEffect, useState } from 'react';
import { useToastModern } from '@/hooks/useToastModern';

export const ToolForm = ({ initialData, onSubmit, isSubmitting }: ToolFormProps) => {
  const defaultBenefitType = initialData?.benefit_type as BenefitType | undefined;
  const [hasChanges, setHasChanges] = useState(!initialData); // Novo formulário sempre tem mudanças
  const { showSuccess, showError } = useToastModern();

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      official_url: initialData?.official_url || '',
      category: initialData?.category || 'Modelos de IA e Interfaces',
      status: initialData?.status ?? true,
      logo_url: initialData?.logo_url || '',
      tags: initialData?.tags || [],
      video_tutorials: initialData?.video_tutorials || [],
      has_member_benefit: initialData?.has_member_benefit || false,
      benefit_type: defaultBenefitType,
      benefit_title: initialData?.benefit_title || '',
      benefit_description: initialData?.benefit_description || '',
      benefit_link: initialData?.benefit_link || '',
      benefit_badge_url: initialData?.benefit_badge_url || '',
    }
  });

  // OTIMIZAÇÃO: Detectar mudanças de forma mais eficiente
  useEffect(() => {
    const subscription = form.watch(() => {
      // Para formulário novo sempre considerar como tendo mudanças
      if (!initialData) {
        setHasChanges(true);
        return;
      }
      
      // Para formulários existentes, verificar se está dirty
      const isDirty = form.formState.isDirty;
      setHasChanges(isDirty);
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const handleFormSubmit = async (data: ToolFormValues) => {
    try {
      const success = await onSubmit(data);
      
      if (success) {
        // Reset o estado de mudanças após salvar com sucesso
        setHasChanges(false);
        form.reset(data); // Reset com os novos dados
        
        showSuccess(
          initialData ? "Ferramenta atualizada" : "Ferramenta criada",
          initialData ? "As alterações foram salvas com sucesso" : "A nova ferramenta foi criada com sucesso"
        );
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      showError("Erro ao salvar", "Ocorreu um erro ao enviar o formulário");
    }
  };

  // OTIMIZAÇÃO: Lógica simplificada para habilitar/desabilitar botão
  const isSaveDisabled = isSubmitting || (!hasChanges && initialData !== undefined);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <BasicInfo form={form} />
        <TagManager form={form} />
        <MemberBenefit className="mt-6" form={form} />
        <VideoTutorials form={form} />
        
        <div className="pt-4 border-t">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSaveDisabled}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Ferramenta'}
          </Button>
          
          {/* OTIMIZAÇÃO: Feedback visual mais claro */}
          <div className="text-sm text-center mt-2">
            {!initialData && (
              <p className="text-primary">
                Preencha os campos e clique para criar a ferramenta
              </p>
            )}
            {initialData && !hasChanges && (
              <p className="text-muted-foreground">
                Faça alterações no formulário para salvar
              </p>
            )}
            {initialData && hasChanges && (
              <p className="text-primary">
                Alterações detectadas - clique para salvar
              </p>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
