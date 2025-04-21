
import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { BusinessModelField } from "./inputs/BusinessModelField";
import { BusinessChallengesField } from "./inputs/BusinessChallengesField";
import { ShortTermGoalsField } from "./inputs/ShortTermGoalsField";
import { MediumTermGoalsField } from "./inputs/MediumTermGoalsField";
import { KpisField } from "./inputs/KpisField";
import { AdditionalContextField } from "./inputs/AdditionalContextField";
import { SubmitButton } from "./SubmitButton";
import { OnboardingProgress } from "@/types/onboarding";
import { toast } from "sonner";

interface BusinessContextFormStepProps {
  progress: OnboardingProgress | null;
  onSave: (data: any) => Promise<void>;
}

interface FormValues {
  business_model: string;
  business_challenges: string[];
  short_term_goals: string[];
  medium_term_goals: string[];
  important_kpis: string[];
  additional_context: string;
}

export const BusinessContextFormStep: React.FC<BusinessContextFormStepProps> = ({ progress, onSave }) => {
  // Obter dados iniciais do contexto de negócios
  const getInitialData = (): FormValues => {
    if (!progress) return {
      business_model: "",
      business_challenges: [],
      short_term_goals: [],
      medium_term_goals: [],
      important_kpis: [],
      additional_context: ""
    };
    
    // Usando business_data ao invés de business_context
    const businessData = progress.business_data || {};
    
    console.log("Dados iniciais do contexto de negócios:", businessData);
    
    return {
      business_model: businessData.business_model || "",
      business_challenges: businessData.business_challenges || [],
      short_term_goals: businessData.short_term_goals || [],
      medium_term_goals: businessData.medium_term_goals || [],
      important_kpis: businessData.important_kpis || [],
      additional_context: businessData.additional_context || "",
    };
  };
  
  const methods = useForm<FormValues>({
    defaultValues: getInitialData(),
  });
  
  // Atualizar formulário quando os dados do progresso mudarem
  useEffect(() => {
    if (progress) {
      const initialData = getInitialData();
      methods.reset(initialData);
    }
  }, [progress]);

  const handleSubmit = async (data: FormValues) => {
    try {
      console.log("Enviando dados do contexto do negócio:", data);
      
      // Preparar os dados para salvar
      const formattedData = {
        business_context: {
          business_model: data.business_model,
          business_challenges: data.business_challenges,
          short_term_goals: data.short_term_goals,
          medium_term_goals: data.medium_term_goals,
          important_kpis: data.important_kpis,
          additional_context: data.additional_context,
        }
      };
      
      await onSave(formattedData);
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados do contexto do negócio:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    }
  };

  // Funções para auto-save dos campos de texto
  const debouncedSave = React.useCallback(
    async () => {
      try {
        const formData = methods.getValues();
        console.log("Auto-salvando dados:", formData);
        
        const formattedData = {
          business_context: {
            business_model: formData.business_model,
            business_challenges: formData.business_challenges,
            short_term_goals: formData.short_term_goals,
            medium_term_goals: formData.medium_term_goals,
            important_kpis: formData.important_kpis,
            additional_context: formData.additional_context,
          }
        };
        
        await onSave(formattedData);
        // Sem toast para auto-save para não incomodar o usuário
      } catch (error) {
        console.error("Erro ao auto-salvar dados:", error);
        // Sem toast para erros de auto-save para não incomodar o usuário
      }
    },
    [methods, onSave]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-8">
          <BusinessModelField 
            control={methods.control} 
            error={methods.formState.errors.business_model}
            onBlur={debouncedSave}
          />
          
          <BusinessChallengesField 
            control={methods.control} 
            error={methods.formState.errors.business_challenges}
            onChange={debouncedSave}
          />
          
          <ShortTermGoalsField 
            control={methods.control} 
            error={methods.formState.errors.short_term_goals}
            onChange={debouncedSave}
          />
          
          <MediumTermGoalsField 
            control={methods.control} 
            error={methods.formState.errors.medium_term_goals}
            onChange={debouncedSave}
          />
          
          <KpisField 
            control={methods.control} 
            error={methods.formState.errors.important_kpis}
            onChange={debouncedSave}
          />
          
          <AdditionalContextField 
            control={methods.control} 
            error={methods.formState.errors.additional_context}
            onBlur={debouncedSave}
          />
          
          <SubmitButton isSubmitting={methods.formState.isSubmitting} />
        </div>
      </form>
    </FormProvider>
  );
};
