
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { OnboardingData } from "@/types/onboarding";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface UseStepPersistenceProps {
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  navigate: any;
}

export const useStepPersistence = ({
  currentStepIndex,
  setCurrentStepIndex,
  navigate
}: UseStepPersistenceProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para salvar dados de etapa
  const saveStepData = async (data: any): Promise<void> => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const currentStep = getCurrentStepName(currentStepIndex);
      const completedSteps = getCompletedSteps(currentStepIndex);
      
      const { data: existingProgress, error: fetchError } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }
      
      let updateData = {
        user_id: user.id,
        current_step: currentStep,
        completed_steps: completedSteps,
        is_completed: false
      };
      
      // Atualiza os dados específicos da etapa atual
      updateData = processStepData(currentStep, data, updateData);
      
      if (existingProgress) {
        // Atualiza o progresso existente
        const { error: updateError } = await supabase
          .from("onboarding_progress")
          .update(updateData)
          .eq("user_id", user.id);
        
        if (updateError) throw updateError;
      } else {
        // Cria um novo registro de progresso
        const { error: insertError } = await supabase
          .from("onboarding_progress")
          .insert(updateData);
        
        if (insertError) throw insertError;
      }
      
      // Avança para a próxima etapa
      navigateToNextStep();
      
      toast.success("Dados salvos com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      toast.error(`Erro ao salvar dados: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para finalizar o onboarding
  const completeOnboarding = async (): Promise<void> => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("onboarding_progress")
        .update({
          is_completed: true,
          current_step: "completed"
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success("Onboarding concluído com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao concluir onboarding:", error);
      toast.error(`Erro ao concluir onboarding: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const navigateToNextStep = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };
  
  const getCurrentStepName = (stepIndex: number): string => {
    const stepNames = [
      "personal",
      "professional_data",
      "business_context",
      "ai_exp",
      "business_goals",
      "experience_personalization",
      "complementary_info",
      "review"
    ];
    
    return stepNames[stepIndex] || "review";
  };
  
  const getCompletedSteps = (currentStepIndex: number): string[] => {
    const stepNames = [
      "personal",
      "professional_data",
      "business_context",
      "ai_exp",
      "business_goals",
      "experience_personalization",
      "complementary_info"
    ];
    
    return stepNames.slice(0, currentStepIndex + 1);
  };
  
  const processStepData = (currentStep: string, data: any, updateData: any) => {
    const result = { ...updateData };
    
    switch (currentStep) {
      case "personal":
        result.personal_info = data;
        break;
      case "professional_data":
        result.professional_info = data;
        // Atualiza os campos de nível superior
        Object.keys(data).forEach(key => {
          if (["company_name", "company_size", "company_sector", "company_website", "current_position", "annual_revenue"].includes(key)) {
            result[key] = data[key];
          }
        });
        break;
      case "business_context":
        result.business_data = data;
        break;
      case "ai_exp":
        result.ai_experience = data;
        // Atualize ai_knowledge_level se disponível
        if (data.knowledge_level) {
          result.ai_knowledge_level = data.knowledge_level;
        }
        break;
      case "business_goals":
        result.business_goals = data;
        // Atualize goals se disponível
        if (data.goals) {
          result.goals = Array.isArray(data.goals) ? data.goals : [data.goals];
        }
        break;
      case "experience_personalization":
        result.experience_personalization = data;
        break;
      case "complementary_info":
        result.complementary_info = data;
        break;
    }
    
    return result;
  };
  
  return {
    saveStepData,
    completeOnboarding,
    isSubmitting
  };
};
