
import React, { useRef } from "react";
import { useProgress } from "../useProgress";
import { buildUpdateObject } from "./stepDataBuilder";
import { navigateAfterStep } from "./stepNavigator";
import { steps } from "../useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";
import { saveProfessionalData } from "./services/professionalDataService";

export function useStepPersistenceCore({
  currentStepIndex,
  setCurrentStepIndex,
  navigate,
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
}) {
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { logError } = useLogging();
  
  const toastShown = React.useRef(false);

  const saveStepData = async (
    stepIdOrData: string | any,
    dataOrShouldNavigate?: any | boolean,
    thirdParam?: boolean
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }

    toastShown.current = false;

    let stepId: string;
    let data: any;
    let shouldNavigate: boolean = true;

    if (typeof stepIdOrData === 'string') {
      stepId = stepIdOrData;
      data = dataOrShouldNavigate;
      shouldNavigate = thirdParam !== undefined ? thirdParam : true;
      console.log(`saveStepData chamado com stepId='${stepId}', data=objeto, shouldNavigate=${shouldNavigate}`);
    } else {
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = typeof dataOrShouldNavigate === 'boolean' ? 
                       dataOrShouldNavigate : true;
      console.log(`saveStepData chamado com data=objeto, shouldNavigate=${shouldNavigate}, inferindo stepId='${stepId}'`);
    }
    
    console.log(`Salvando dados do passo ${stepId}, índice ${currentStepIndex}:`, data);
    console.log("Estado atual do progresso:", progress);

    try {
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        if (!toastShown.current) {
          toast.warning("Sem dados para salvar");
          toastShown.current = true;
        }
        return;
      }

      console.log("Dados a serem enviados para o banco:", updateObj);

      try {
        if (stepId === 'professional_data') {
          await saveProfessionalData(progress.id, progress.user_id, data);
          console.log("Dados profissionais salvos na tabela específica com sucesso");
        }
      } catch (serviceError) {
        console.error(`Erro ao salvar dados para serviço específico (${stepId}):`, serviceError);
      }

      // IMPORTANTE: Nunca forçar is_completed = true aqui
      // O banco agora tem validação rigorosa via trigger
      const result = await updateProgress(updateObj);
      
      if (!result || (result as any).error) {
        const errorMessage = (result as any)?.error?.message || "Erro desconhecido ao atualizar dados";
        console.error("Erro ao atualizar dados:", errorMessage);
        logError("save_step_data_error", { 
          step: stepId, 
          error: errorMessage,
          stepIndex: currentStepIndex
        });
        if (!toastShown.current) {
          toast.error("Erro ao salvar dados. Por favor, tente novamente.");
          toastShown.current = true;
        }
        return;
      }
      
      const updatedProgress = (result as any).data || { ...progress, ...updateObj };
      console.log("Progresso atualizado com sucesso:", updatedProgress);
      
      if (!toastShown.current) {
        toast.success("Dados salvos com sucesso!");
        toastShown.current = true;
      }
      
      await refreshProgress();
      console.log("Dados locais atualizados após salvar");
      
      if (shouldNavigate) {
        console.log("Tentando navegar para a próxima etapa...");
        navigateAfterStep(stepId, currentStepIndex, navigate);
      } else {
        console.log("Navegação automática desativada, permanecendo na página atual");
      }
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      logError("save_step_data_error", { 
        step: stepId, 
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex
      });
      if (!toastShown.current) {
        toast.error("Erro ao salvar dados. Por favor, tente novamente.");
        toastShown.current = true;
      }
      throw error;
    }
  };

  const completeOnboarding = async () => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return;
    }
    
    try {
      console.log("Completando onboarding...");
      
      // Verificar se todas as etapas obrigatórias foram realmente completadas
      const requiredSteps = [
        'personal_info',
        'professional_info',
        'business_context', 
        'ai_experience',
        'business_goals',
        'experience_personalization',
        'complementary_info',
        'review'
      ];
      
      // Validar se todos os dados necessários estão presentes
      const hasPersonalInfo = progress.personal_info?.name && progress.personal_info?.email;
      const hasProfessionalInfo = progress.professional_info?.company_name;
      const hasBusinessGoals = progress.business_goals?.primary_goal;
      const hasAIExperience = progress.ai_experience?.knowledge_level;
      
      if (!hasPersonalInfo || !hasProfessionalInfo || !hasBusinessGoals || !hasAIExperience) {
        toast.error("Por favor, complete todas as etapas obrigatórias antes de finalizar.");
        return;
      }
      
      // Tentar marcar como completo - o trigger do banco vai validar
      const result = await updateProgress({
        is_completed: true,
        completed_steps: requiredSteps,
        current_step: 'completed'
      });
      
      if ((result as any)?.error) {
        // Se o trigger rejeitou, mostrar mensagem específica
        const errorMessage = (result as any).error.message;
        if (errorMessage.includes('dados obrigatórios faltando')) {
          toast.error("Ainda há dados obrigatórios que precisam ser preenchidos. Verifique todas as etapas.");
          return;
        }
        throw new Error(errorMessage || "Erro ao completar onboarding");
      }
      
      await refreshProgress();
      console.log("Onboarding marcado como completo, preparando redirecionamento para página de conclusão...");
      
      toast.success("Onboarding concluído com sucesso!");
      
      navigate("/onboarding/completed");
    } catch (error: any) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      if (error.message && error.message.includes('dados obrigatórios faltando')) {
        toast.error("Ainda há dados obrigatórios que precisam ser preenchidos. Verifique todas as etapas.");
      } else {
        toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      }
      
      // Em caso de erro, não redirecionar automaticamente
      console.log("Erro ao completar onboarding, usuário pode revisar os dados");
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
