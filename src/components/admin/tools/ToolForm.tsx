
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
import { BenefitType, Tool } from '@/types/toolTypes';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

export const ToolForm = ({ 
  initialData, 
  onSubmit, 
  isSubmitting,
  onSaveSuccess 
}: ToolFormProps & { 
  onSaveSuccess?: (savedData: Tool) => void 
}) => {
  // Garantir que benefit_type seja sempre um dos valores válidos
  const defaultBenefitType = initialData?.benefit_type as BenefitType | undefined;
  const [formChanged, setFormChanged] = useState(false);
  const [showSuccessIcon, setShowSuccessIcon] = useState(false);
  const { toast } = useToast();

  // Inicializa o formulário com valores padrão ou existentes, garantindo que category nunca seja string vazia
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
      formModified: initialData ? false : true // Novos formulários começam como modificados
    }
  });

  // Se for um novo formulário (sem initialData), marcar como modificado para habilitar o botão de salvar
  useEffect(() => {
    if (!initialData) {
      setFormChanged(true);
    }
  }, [initialData]);

  // Atualizar formulário quando initialData mudar (após salvamento)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        official_url: initialData.official_url || '',
        category: initialData.category || 'Modelos de IA e Interfaces',
        status: initialData.status ?? true,
        logo_url: initialData.logo_url || '',
        tags: initialData.tags || [],
        video_tutorials: initialData.video_tutorials || [],
        has_member_benefit: initialData.has_member_benefit || false,
        benefit_type: initialData.benefit_type as BenefitType | undefined,
        benefit_title: initialData.benefit_title || '',
        benefit_description: initialData.benefit_description || '',
        benefit_link: initialData.benefit_link || '',
        benefit_badge_url: initialData.benefit_badge_url || '',
        formModified: false
      });
      setFormChanged(false);
    }
  }, [initialData, form]);

  // Monitorar o estado do formulário para detectar mudanças
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Verificar se o formulário foi explicitamente marcado como modificado via field
      if (form.getValues('formModified')) {
        console.log('Formulário marcado como modificado via formModified field');
        setFormChanged(true);
        return;
      }
      
      // Se não houver dados iniciais, o formulário é novo e deve estar sempre habilitado
      if (!initialData) {
        setFormChanged(true);
        return;
      }
      
      // Verificar se o formulário está "dirty" segundo o React Hook Form
      const isDirty = form.formState.isDirty;
      if (isDirty) {
        console.log('Formulário marcado como dirty pelo React Hook Form');
        setFormChanged(true);
        return;
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const handleFormSubmit = async (data: ToolFormValues) => {
    try {
      console.log("Formulário enviado:", data);
      
      // Remover campos auxiliares antes de enviar para o backend
      const { formModified, ...submitData } = data;
      
      const result = await onSubmit(submitData);
      
      if (result.success) {
        // Reset o estado do formulário após salvar com sucesso
        setFormChanged(false);
        form.setValue("formModified", false);
        
        // Mostrar ícone de sucesso temporariamente
        setShowSuccessIcon(true);
        setTimeout(() => setShowSuccessIcon(false), 2000);
        
        // Notificar o componente pai sobre o sucesso
        if (result.data && onSaveSuccess) {
          onSaveSuccess(result.data);
        }
      }
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
            className="w-full relative" 
            disabled={isSaveDisabled}
          >
            <div className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                'Salvando...'
              ) : showSuccessIcon ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  'Salvo!'
                </>
              ) : (
                'Salvar Ferramenta'
              )}
            </div>
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
          {showSuccessIcon && (
            <p className="text-sm text-green-600 text-center mt-2 animate-fade-in">
              ✓ Alterações salvas com sucesso
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
