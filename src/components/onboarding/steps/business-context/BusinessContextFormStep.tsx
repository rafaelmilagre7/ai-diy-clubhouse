import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { BusinessModelField } from "./inputs/BusinessModelField";
import { BusinessChallengesField } from "./inputs/BusinessChallengesField";
import { ShortTermGoalsField } from "./inputs/ShortTermGoalsField";
import { MediumTermGoalsField } from "./inputs/MediumTermGoalsField";
import { KpisField } from "./inputs/KpisField";
import { AdditionalContextField } from "./inputs/AdditionalContextField";
import { NavigationButtons } from "@/components/onboarding/steps/NavigationButtons";
import { OnboardingProgress } from "@/types/onboarding";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  // Obter dados iniciais do contexto de negócios da coluna correta
  const getInitialData = (): FormValues => {
    if (!progress) return {
      business_model: "",
      business_challenges: [],
      short_term_goals: [],
      medium_term_goals: [],
      important_kpis: [],
      additional_context: ""
    };
    
    // Usar business_context para acessar os dados existentes
    const contextData = progress.business_context || {};
    
    console.log("Dados iniciais do contexto de negócios:", contextData);
    
    return {
      business_model: contextData.business_model || "",
      business_challenges: contextData.business_challenges || [],
      short_term_goals: contextData.short_term_goals || [],
      medium_term_goals: contextData.medium_term_goals || [],
      important_kpis: contextData.important_kpis || [],
      additional_context: contextData.additional_context || "",
    };
  };
  
  const methods = useForm<FormValues>({
    defaultValues: getInitialData(),
  });
  
  // Atualizar formulário quando os dados do progresso mudarem
  useEffect(() => {
    if (progress) {
      const initialData = getInitialData();
      console.log("Atualizando formulário com dados iniciais:", initialData);
      methods.reset(initialData);
    }
  }, [progress]);

  const handleSubmit = async (data: FormValues) => {
    try {
      console.log("Enviando dados do contexto do negócio:", data);
      
      // Validar que os dados obrigatórios estão preenchidos
      if (!data.business_model) {
        toast.error("Por favor, selecione um modelo de negócio");
        return;
      }
      
      if (!data.business_challenges || data.business_challenges.length === 0) {
        toast.error("Por favor, selecione pelo menos um desafio de negócio");
        return;
      }
      
      // Chamar onSave com os dados completos e validados
      await onSave(data);
    } catch (error) {
      console.error("Erro ao salvar dados do contexto do negócio:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    }
  };

  // Função para voltar à etapa anterior
  const handlePreviousStep = () => {
    navigate("/onboarding/professional-data");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-8">
          <BusinessModelField 
            control={methods.control} 
            error={methods.formState.errors.business_model}
          />
          
          <BusinessChallengesField 
            control={methods.control} 
            error={methods.formState.errors.business_challenges}
          />
          
          <ShortTermGoalsField 
            control={methods.control} 
            error={methods.formState.errors.short_term_goals}
          />
          
          <MediumTermGoalsField 
            control={methods.control} 
            error={methods.formState.errors.medium_term_goals}
          />
          
          <KpisField 
            control={methods.control} 
            error={methods.formState.errors.important_kpis}
          />
          
          <AdditionalContextField 
            control={methods.control} 
            error={methods.formState.errors.additional_context}
          />
          
          <NavigationButtons 
            isSubmitting={methods.formState.isSubmitting} 
            onPrevious={handlePreviousStep}
            submitText="Continuar"
            loadingText="Salvando..."
          />
        </div>
      </form>
    </FormProvider>
  );
};
