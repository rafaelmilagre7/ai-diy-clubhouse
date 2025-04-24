
import React, { useEffect, useRef, useCallback } from "react";
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
  const formInitialized = useRef(false);
  const submitting = useRef(false);
  
  // Obter dados iniciais do contexto de negócios da coluna correta
  const getInitialData = useCallback((): FormValues => {
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
    
    return {
      business_model: contextData.business_model || "",
      business_challenges: Array.isArray(contextData.business_challenges) ? contextData.business_challenges : [],
      short_term_goals: Array.isArray(contextData.short_term_goals) ? contextData.short_term_goals : [],
      medium_term_goals: Array.isArray(contextData.medium_term_goals) ? contextData.medium_term_goals : [],
      important_kpis: Array.isArray(contextData.important_kpis) ? contextData.important_kpis : [],
      additional_context: contextData.additional_context || "",
    };
  }, [progress]);
  
  const methods = useForm<FormValues>({
    defaultValues: getInitialData(),
  });
  
  // Atualizar formulário apenas quando os dados do progresso mudarem e apenas uma vez
  useEffect(() => {
    if (progress && !formInitialized.current) {
      const initialData = getInitialData();
      console.log("Inicializando formulário com dados:", initialData);
      methods.reset(initialData);
      formInitialized.current = true;
    }
  }, [progress, getInitialData, methods]);

  const handleSubmit = async (data: FormValues) => {
    // Evitar envios múltiplos simultâneos
    if (submitting.current) {
      console.log("Já existe um envio em andamento, ignorando");
      return;
    }
    
    try {
      submitting.current = true;
      console.log("Enviando dados do contexto do negócio:", data);
      
      // Validar que os dados obrigatórios estão preenchidos
      if (!data.business_model) {
        toast.error("Por favor, selecione um modelo de negócio");
        submitting.current = false;
        return;
      }
      
      if (!data.business_challenges || data.business_challenges.length === 0) {
        toast.error("Por favor, selecione pelo menos um desafio de negócio");
        submitting.current = false;
        return;
      }
      
      // Chamar onSave com os dados completos e validados
      await onSave(data);
      // Não definir submitting como false aqui, pois deve haver um redirecionamento após o salvamento
    } catch (error) {
      console.error("Erro ao salvar dados do contexto do negócio:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      submitting.current = false;
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
