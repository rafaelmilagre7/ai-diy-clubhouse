
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
  const [logoUrlChanged, setLogoUrlChanged] = useState(false);
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
      
      // Verificação inicial do logo_url
      const currentLogoUrl = form.getValues('logo_url');
      const initialLogoUrl = initialData?.logo_url || '';
      
      if (currentLogoUrl !== initialLogoUrl) {
        console.log('Logo URL diferente na inicialização:', { currentLogoUrl, initialLogoUrl });
        setLogoUrlChanged(true);
        setFormChanged(true);
      }
    }
  }, []);

  // Monitorar o logoChanged via evento customizado
  useEffect(() => {
    const handleLogoChange = (event: CustomEvent) => {
      console.log('Evento de mudança de logo detectado', event.detail);
      setLogoUrlChanged(true);
      setFormChanged(true);
      
      // Forçar validação do formulário para atualizar o estado
      form.trigger();
    };
    
    document.addEventListener('logoChanged', handleLogoChange as EventListener);
    return () => {
      document.removeEventListener('logoChanged', handleLogoChange as EventListener);
    };
  }, [form]);

  // Verificador de mudanças diretas no logo_url
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'logo_url') {
        const currentLogoUrl = form.getValues('logo_url');
        const initialLogoUrl = initialData?.logo_url || '';
        
        if (currentLogoUrl !== initialLogoUrl) {
          console.log('Logo URL mudou via watch:', { currentLogoUrl, initialLogoUrl });
          setLogoUrlChanged(true);
          setFormChanged(true);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  // Monitorar o estado do formulário para detectar mudanças
  useEffect(() => {
    const subscription = form.watch(() => {
      // Se não houver dados iniciais, o formulário é novo e deve estar sempre habilitado
      if (!initialData) {
        setFormChanged(true);
        return;
      }
      
      // Verificar explicitamente se algum campo foi alterado
      let hasChanges = false;
      
      if (form.getValues('name') !== initialData.name) {
        hasChanges = true;
      }
      if (form.getValues('description') !== initialData.description) {
        hasChanges = true;
      }
      if (form.getValues('official_url') !== initialData.official_url) {
        hasChanges = true;
      }
      if (form.getValues('category') !== initialData.category) {
        hasChanges = true;
      }
      if (form.getValues('status') !== initialData.status) {
        hasChanges = true;
      }
      
      // Verificar logo_url explicitamente
      const currentLogoUrl = form.getValues('logo_url');
      const initialLogoUrl = initialData.logo_url || '';
      if (currentLogoUrl !== initialLogoUrl) {
        hasChanges = true;
      }
      
      // Verificar se há diferença nos arrays
      const currentTags = form.getValues('tags');
      const initialTags = initialData.tags || [];
      if (currentTags.length !== initialTags.length || 
          currentTags.some((tag, i) => tag !== initialTags[i])) {
        hasChanges = true;
      }
      
      // Verificar se o formulário foi alterado ou se o logo mudou
      setFormChanged(hasChanges || logoUrlChanged || form.formState.isDirty);
      
      console.log('Estado do formulário:', { 
        hasChanges, 
        logoUrlChanged,
        isDirty: form.formState.isDirty,
        formChanged: hasChanges || logoUrlChanged || form.formState.isDirty
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData, logoUrlChanged]);

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
