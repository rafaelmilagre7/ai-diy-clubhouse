
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
import { useEffect, useState, useRef } from 'react';

export const ToolForm = ({ initialData, onSubmit, isSubmitting }: ToolFormProps) => {
  // Garantir que benefit_type seja sempre um dos valores válidos
  const defaultBenefitType = initialData?.benefit_type as BenefitType | undefined;
  const [formChanged, setFormChanged] = useState(false);
  const formMountedRef = useRef(false);

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

  // Realizar verificação inicial logo após o formulário ser montado
  useEffect(() => {
    if (!formMountedRef.current) {
      formMountedRef.current = true;
      console.log('Formulário montado com valores iniciais:', form.getValues());
    }
  }, []);

  // Monitorar o estado do formulário para detectar mudanças
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      console.log(`Campo alterado: ${name}, tipo: ${type}`);
      
      // Se não houver dados iniciais, o formulário é novo e deve estar sempre habilitado
      if (!initialData) {
        setFormChanged(true);
        return;
      }
      
      // Verificar se os valores atuais do formulário são diferentes dos valores iniciais
      const isDirty = form.formState.isDirty;
      
      // Verificar explicitamente o logo_url
      const logoChanged = initialData.logo_url !== form.getValues('logo_url');
      
      if (isDirty || logoChanged) {
        console.log('Formulário modificado:', { isDirty, logoChanged });
        setFormChanged(true);
      } else {
        setFormChanged(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const handleFormSubmit = (data: ToolFormValues) => {
    console.log("Formulário enviado:", data);
    onSubmit(data);
  };

  // Garantir que o botão de salvar seja habilitado quando houver mudanças
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
          {(formChanged && initialData) && (
            <p className="text-sm text-primary text-center mt-2">
              Alterações detectadas - clique para salvar
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
