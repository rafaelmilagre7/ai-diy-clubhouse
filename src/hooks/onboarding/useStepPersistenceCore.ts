
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

  const saveStepData = async (
    stepIdOrData: string | any,
    shouldNavigateOrData?: boolean | any,
    thirdParam?: boolean
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Dados não salvos: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }

    let stepId: string;
    let data: any;
    let shouldNavigate: boolean = true;

    // Determinar os parâmetros com base na assinatura usada
    if (typeof stepIdOrData === 'string') {
      stepId = stepIdOrData;
      data = shouldNavigateOrData;
      shouldNavigate = thirdParam !== undefined ? thirdParam : true;
      console.log(`saveStepData chamado com assinatura: (stepId: ${stepId}, data: objeto, shouldNavigate: ${shouldNavigate})`);
    } else {
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = shouldNavigateOrData !== undefined ? 
                       typeof shouldNavigateOrData === 'boolean' ? shouldNavigateOrData : true 
                       : true;
      console.log(`saveStepData chamado com assinatura: (data: objeto, shouldNavigate: ${shouldNavigate})`);
    }
    
    console.log(`Salvando dados - Passo: ${stepId}, índice ${currentStepIndex}, navegação: ${shouldNavigate ? "SIM" : "NÃO"}`, data);
    console.log("Estado atual do progresso:", progress);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        toast.warning("Sem dados para salvar");
        return;
      }

      console.log("Objeto de atualização preparado para o Supabase:", updateObj);

      // Atualizar no Supabase
      const updatedProgress = await updateProgress(updateObj);
      console.log("Resposta do Supabase após salvamento:", updatedProgress);

      // Forçar atualização dos dados local após salvar
      await refreshProgress();
      console.log("Dados locais atualizados após salvamento");
      
      // Notificar usuário do salvamento
      toast.success("Dados salvos com sucesso!");
      
      // Navegação para próxima etapa
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
          console.log(`Navegando para rota mapeada: ${nextRouteMap[stepId]}`);
          setTimeout(() => {
            navigate(nextRouteMap[stepId]);
          }, 500);
        } else {
          // Fallback para navegador padrão de etapas
          console.log(`Sem rota mapeada para ${stepId}, usando navegação padrão`);
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

  // Adicionar a função completeOnboarding
  const completeOnboarding = async (): Promise<void> => {
    if (!progress?.id) {
      toast.error("Progresso não encontrado. Tente recarregar a página.");
      return;
    }
    
    try {
      console.log("Completando onboarding...");
      
      // Marca o onboarding como concluído
      const result = await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      
      if ((result as any)?.error) {
        throw new Error((result as any).error.message || "Erro ao completar onboarding");
      }
      
      // Atualiza dados locais
      await refreshProgress();
      console.log("Onboarding marcado como completo, preparando redirecionamento para trilha...");
      
      toast.success("Onboarding concluído com sucesso!");
      
      // Redirecionamento após delay para garantir atualização do estado
      setTimeout(() => {
        window.location.href = "/implementation-trail";
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      
      // Fallback para dashboard em caso de erro
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  return {
    saveStepData,
    completeOnboarding  // Exportando a função aqui
  };
}
