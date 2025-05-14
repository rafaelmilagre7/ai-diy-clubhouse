
import React, { useEffect, useRef, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { BusinessModelField } from "./inputs/BusinessModelField";
import { BusinessChallengesField } from "./inputs/BusinessChallengesField";
import { ShortTermGoalsField } from "./inputs/ShortTermGoalsField";
import { MediumTermGoalsField } from "./inputs/MediumTermGoalsField";
import { KpisField } from "./inputs/KpisField";
import { AdditionalContextField } from "./inputs/AdditionalContextField";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
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
  
  // Log detalhado do progress para ajudar na depuração
  console.log("[BusinessContextFormStep] Progress recebido:", progress);
  
  // Extrair dados do contexto de negócios da coluna correta
  const getInitialData = useCallback((): FormValues => {
    if (!progress) return {
      business_model: "",
      business_challenges: [],
      short_term_goals: [],
      medium_term_goals: [],
      important_kpis: [],
      additional_context: ""
    };
    
    // Log para depuração
    console.log("[BusinessContextFormStep] business_context:", progress.business_context);
    console.log("[BusinessContextFormStep] business_data:", progress.business_data);
    
    // Buscar dados do business_context (novo formato) ou business_data (formato antigo)
    const contextData = progress.business_context || progress.business_data || {};
    
    // Garantir que os arrays são realmente arrays
    const ensureArray = (value: any): string[] => {
      if (!value) return [];
      return Array.isArray(value) ? value : [];
    };
    
    return {
      business_model: contextData.business_model || "",
      business_challenges: ensureArray(contextData.business_challenges),
      short_term_goals: ensureArray(contextData.short_term_goals),
      medium_term_goals: ensureArray(contextData.medium_term_goals),
      important_kpis: ensureArray(contextData.important_kpis),
      additional_context: contextData.additional_context || "",
    };
  }, [progress]);
  
  const methods = useForm<FormValues>({
    defaultValues: getInitialData(),
  });
  
  // Atualizar formulário quando os dados do progresso mudarem
  useEffect(() => {
    if (progress) {
      const initialData = getInitialData();
      console.log("[BusinessContextFormStep] Inicializando formulário com dados:", initialData);
      methods.reset(initialData);
      formInitialized.current = true;
    }
  }, [progress, getInitialData, methods]);

  const handleSubmit = async (data: FormValues) => {
    // Evitar envios múltiplos simultâneos
    if (submitting.current) {
      console.log("[BusinessContextFormStep] Já existe um envio em andamento, ignorando");
      return;
    }
    
    try {
      submitting.current = true;
      console.log("[BusinessContextFormStep] Enviando dados do contexto do negócio:", data);
      
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
      
      // Chamar onSave com os dados não aninhados
      // Os dados serão tratados corretamente no hook useStepPersistenceCore
      await onSave(data);
      
    } catch (error) {
      console.error("[BusinessContextFormStep] Erro ao salvar dados do contexto do negócio:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
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
            isSubmitting={methods.formState.isSubmitting || submitting.current} 
            onPrevious={handlePreviousStep}
            submitText="Continuar"
            loadingText="Salvando..."
          />
        </div>
      </form>
    </FormProvider>
  );
};
