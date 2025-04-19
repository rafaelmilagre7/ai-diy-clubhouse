
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

export const ToolForm = ({ initialData, onSubmit, isSubmitting }: ToolFormProps) => {
  // Garantir que benefit_type seja sempre um dos valores válidos
  const defaultBenefitType = initialData?.benefit_type as BenefitType | undefined;
  const [formChanged, setFormChanged] = useState(false);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      official_url: initialData?.official_url || '',
      category: initialData?.category || '',
      status: initialData?.status ?? true,
      logo_url: initialData?.logo_url || '',
      tags: initialData?.tags || [],
      video_tutorials: initialData?.video_tutorials || [],
      has_member_benefit: initialData?.has_member_benefit || false,
      benefit_type: defaultBenefitType,
      benefit_title: initialData?.benefit_title || '',
      benefit_description: initialData?.benefit_description || '',
      benefit_link: initialData?.benefit_link || '',
      benefit_badge_url: initialData?.benefit_badge_url || ''
    }
  });

  // Monitorar o estado do formulário para detectar mudanças
  useEffect(() => {
    const subscription = form.watch(() => {
      // Verificar explicitamente se algum campo foi alterado
      const formValues = form.getValues();
      let hasChanges = false;
      
      // Se não houver dados iniciais, o formulário é novo e deve estar sempre habilitado
      if (!initialData) {
        setFormChanged(true);
        return;
      }
      
      // Comparar os valores atuais com os valores iniciais
      if (formValues.name !== initialData.name) hasChanges = true;
      if (formValues.description !== initialData.description) hasChanges = true;
      if (formValues.official_url !== initialData.official_url) hasChanges = true;
      if (formValues.category !== initialData.category) hasChanges = true;
      if (formValues.status !== initialData.status) hasChanges = true;
      if (formValues.logo_url !== initialData.logo_url) hasChanges = true;
      
      // Verificar também se o formulário está marcado como dirty pelo react-hook-form
      if (form.formState.isDirty) hasChanges = true;
      
      setFormChanged(hasChanges);
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const handleFormSubmit = (data: ToolFormValues) => {
    console.log("Formulário enviado:", data);
    onSubmit(data);
  };

  // Verificação melhorada para garantir que o botão de salvar seja habilitado corretamente
  const isSaveDisabled = isSubmitting || (!formChanged && initialData !== undefined);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <BasicInfo form={form} />
        <TagManager form={form} />
        <MemberBenefit className="mt-6" />
        <VideoTutorials form={form} />
        
        <div className="pt-4 border-t">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSaveDisabled}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Ferramenta'}
          </Button>
          {(!formChanged && initialData) && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Faça alterações no formulário para salvar
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
