
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
import { toast } from '@/hooks/use-toast';

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
      benefit_badge_url: initialData?.benefit_badge_url || '',
      formModified: initialData ? false : true // Novos formulários começam como modificados
    }
  });

  // Realizar verificação inicial logo após o formulário ser montado
  useEffect(() => {
    if (!formMountedRef.current) {
      formMountedRef.current = true;
      console.log('Formulário montado com valores iniciais:', form.getValues());
      
      // Se for um novo formulário (sem initialData), marcar como modificado para habilitar o botão de salvar
      if (!initialData) {
        setFormChanged(true);
      }
    }
  }, [initialData]);

  // Monitorar o estado do formulário para detectar mudanças
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      console.log(`Campo alterado: ${name}, tipo: ${type}`);
      
      // Verificar se o formulário foi explicitamente marcado como modificado
      if (form.getValues('formModified')) {
        console.log('Formulário marcado como modificado explicitamente');
        setFormChanged(true);
        return;
      }
      
      // Se não houver dados iniciais, o formulário é novo e deve estar sempre habilitado
      if (!initialData) {
        setFormChanged(true);
        return;
      }
      
      // Verificar se os valores atuais do formulário são diferentes dos valores iniciais
      const isDirty = form.formState.isDirty;
      
      // Verificar explicitamente o logo_url, já que pode ser alterado via upload
      const logoChanged = form.getValues('logo_url') !== initialData.logo_url;
      
      // Verificar explicitamente arrays (tags e video_tutorials)
      const tagsChanged = JSON.stringify(form.getValues('tags')) !== JSON.stringify(initialData.tags || []);
      
      // Verificação especial para video_tutorials - comparação mais detalhada
      const currentVideos = form.getValues('video_tutorials') || [];
      const initialVideos = initialData.video_tutorials || [];
      
      // Considerar mudança se o número de vídeos for diferente
      let videosChanged = currentVideos.length !== initialVideos.length;
      
      // Se o número de vídeos for igual, verificar cada vídeo individualmente
      if (!videosChanged && currentVideos.length > 0) {
        videosChanged = JSON.stringify(currentVideos) !== JSON.stringify(initialVideos);
      }
      
      console.log('Verificação de mudanças:', { 
        isDirty, 
        logoChanged, 
        tagsChanged, 
        videosChanged,
        currentVideos: currentVideos.length,
        initialVideos: initialVideos.length
      });
      
      if (isDirty || logoChanged || tagsChanged || videosChanged) {
        console.log('Formulário modificado');
        setFormChanged(true);
      } else {
        setFormChanged(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const handleFormSubmit = (data: ToolFormValues) => {
    try {
      console.log("Formulário enviado:", data);
      
      // Remover campos auxiliares antes de enviar para o backend
      const { formModified, ...submitData } = data;
      
      onSubmit(submitData);
      
      toast({
        title: "Formulário enviado",
        description: "Salvando alterações...",
      });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao enviar o formulário",
        variant: "destructive"
      });
    }
  };

  // Garantir que o botão de salvar seja habilitado quando houver mudanças ou for um novo formulário
  const isSaveDisabled = isSubmitting || (!formChanged && initialData !== undefined);

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
          {(!initialData) && (
            <p className="text-sm text-primary text-center mt-2">
              Preencha os campos e clique para criar a ferramenta
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
