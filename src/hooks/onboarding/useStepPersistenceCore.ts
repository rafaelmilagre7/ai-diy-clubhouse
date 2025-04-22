
import { useProgress } from "./useProgress";
import { buildUpdateObject } from "./persistence/stepDataBuilder";
import { navigateAfterStep } from "./persistence/stepNavigator";
import { steps } from "./useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

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

  // Função principal para salvar dados de um passo específico
  const saveStepData = async (
    stepIdOrData: string | any,
    shouldNavigateOrData?: boolean | any,
    thirdParam?: boolean
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }

    // Determinar os parâmetros corretos com base na assinatura usada
    let stepId: string;
    let data: any;
    let shouldNavigate: boolean = true;

    // Caso 1: saveStepData(stepId: string, data: any, shouldNavigate?: boolean)
    if (typeof stepIdOrData === 'string') {
      stepId = stepIdOrData;
      data = shouldNavigateOrData;
      shouldNavigate = thirdParam !== undefined ? thirdParam : true;
    } 
    // Caso 2: saveStepData(data: any, shouldNavigate?: boolean)
    else {
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = shouldNavigateOrData !== undefined ? 
                       typeof shouldNavigateOrData === 'boolean' ? shouldNavigateOrData : true 
                       : true;
    }
    
    console.log(`Salvando dados do passo ${stepId}, índice ${currentStepIndex}, navegação automática: ${shouldNavigate ? "SIM" : "NÃO"}`, data);
    console.log("Estado atual do progresso:", progress);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        toast.warning("Sem dados para salvar");
        return;
      }

      console.log("Dados a serem enviados para o banco:", updateObj);

      // Atualizar no Supabase
      const updatedProgress = await updateProgress(updateObj);
      console.log("Dados atualizados com sucesso no banco:", updatedProgress);

      // Forçar atualização dos dados local após salvar
      await refreshProgress();
      console.log("Dados locais atualizados após salvar");
      
      // Notificar usuário do salvamento
      toast.success("Dados salvos com sucesso!");
      
      // Garantir navegação adequada para próxima etapa
      if (shouldNavigate) {
        // Mapeamento direto de etapas para rotas de navegação
        const nextRouteMap: {[key: string]: string} = {
          "personal": "/onboarding/professional-data",
          "professional_data": "/onboarding/business-context",
          "business_context": "/onboarding/ai-experience",
          "ai_exp": "/onboarding/club-goals",
          "business_goals": "/onboarding/customization",
          "experience_personalization": "/onboarding/complementary",
          "complementary_info": "/onboarding/review"
        };
        
        if (nextRouteMap[stepId]) {
          setTimeout(() => {
            navigate(nextRouteMap[stepId]);
          }, 500);
        } else {
          // Fallback para navegador padrão de etapas
          navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate);
        }
      } else {
        console.log("Navegação automática desativada, permanecendo na página atual");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      logError("save_step_data_error", { 
        step: stepId, 
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex
      });
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
      throw error;
    }
  };

  // Finaliza onboarding (marca como completo e leva à tela de trilha)
  const completeOnboarding = async () => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return;
    }
    
    try {
      console.log("Completando onboarding...");
      
      // Marca o onboarding como concluído
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      
      // Atualiza dados locais
      await refreshProgress();
      console.log("Onboarding marcado como completo, preparando redirecionamento para trilha...");
      
      toast.success("Onboarding concluído com sucesso!");
      
      // Redirecionamento após delay para garantir atualização do estado
      setTimeout(() => {
        navigate("/implementation-trail");
      }, 1000);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      
      // Fallback para dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
