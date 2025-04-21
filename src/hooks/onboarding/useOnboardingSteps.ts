
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OnboardingStep } from "@/types/onboarding";
import { useProgress } from "./useProgress";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const useOnboardingSteps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { progress, refreshProgress, isLoading } = useProgress();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definição de todas as etapas do onboarding
  const steps: OnboardingStep[] = [
    { id: "personal", title: "Informações Pessoais", section: "personal_info", path: "/onboarding" },
    { id: "professional_data", title: "Dados Profissionais", section: "professional_info", path: "/onboarding/professional-data" },
    { id: "business_context", title: "Contexto do Negócio", section: "business_data", path: "/onboarding/business-context" },
    { id: "ai_exp", title: "Experiência com IA", section: "ai_experience", path: "/onboarding/ai-experience" },
    { id: "business_goals", title: "Expectativas e Objetivos", section: "business_goals", path: "/onboarding/club-goals" },
    { id: "experience_personalization", title: "Personalização da Experiência", section: "experience_personalization", path: "/onboarding/customization" },
    { id: "complementary_info", title: "Informações Complementares", section: "complementary_info", path: "/onboarding/complementary-info" },
    { id: "review", title: "Revisão e Conclusão", section: "review", path: "/onboarding/review" },
  ];

  // Função para salvar dados da etapa - Modificada para aceitar apenas um argumento de dados
  const saveStepData = useCallback(async (data: any) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const currentStep = steps[currentStepIndex];
      const completedSteps = steps.slice(0, currentStepIndex + 1).map(step => step.id);
      
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
        current_step: currentStep.id,
        completed_steps: completedSteps,
        is_completed: false
      };
      
      // Atualiza os dados específicos da etapa atual
      const section = currentStep.section as string;
      updateData = {
        ...updateData,
        [section]: data
      };
      
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
      await refreshProgress();
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      toast.error(`Erro ao salvar dados: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentStepIndex, steps, refreshProgress]);
  
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
    setCurrentStepIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < steps.length) {
        navigate(steps[nextIndex].path);
      }
      return nextIndex;
    });
  };
  
  const navigateToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
      navigate(steps[stepIndex].path);
    }
  };

  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;
  
  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    steps,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep,
    refreshProgress
  };
};
