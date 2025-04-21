
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
    data: any,
    shouldNavigate: boolean = true
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados");
      return;
    }

    // Identificar qual é o passo atual baseado no input ou currentStepIndex
    const currentStep = typeof data.stepId === 'string' ? data.stepId : steps[currentStepIndex]?.id || '';
    const stepData = typeof data.data === 'object' ? data.data : data;
    
    console.log(`Salvando dados do passo ${currentStep}, índice ${currentStepIndex}, navegação automática: ${shouldNavigate ? "SIM" : "NÃO"}`, stepData);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(currentStep, stepData, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        return;
      }

      console.log("Dados a serem enviados para o Supabase:", updateObj);

      // Atualizar no Supabase
      const updatedProgress = await updateProgress(updateObj);
      console.log("Dados atualizados com sucesso no banco:", updatedProgress);

      // Forçar atualização dos dados local após salvar
      await refreshProgress();
      console.log("Dados locais atualizados após salvar");
      
      // Notificar usuário do salvamento - APENAS se estiver avançando de etapa
      if (shouldNavigate) {
        console.log(`Iniciando navegação automática após salvar o passo ${currentStep}`);
        navigateAfterStep(currentStep, currentStepIndex, navigate, shouldNavigate);
      } else {
        console.log("Navegação automática desativada, permanecendo na página atual");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      logError("save_step_data_error", { 
        step: currentStep, 
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
      
      // Usar setTimeout para garantir que a navegação ocorra após a atualização do estado
      setTimeout(() => {
        try {
          // Redirecionar para a página de implementação
          navigate("/implementation-trail");
        } catch (navError) {
          console.error("Erro ao navegar:", navError);
          logError("navigation_error", { 
            from: "completeOnboarding", 
            error: navError instanceof Error ? navError.message : String(navError) 
          });
          // Fallback para dashboard em caso de erro de navegação
          navigate("/dashboard");
        }
      }, 500);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding.");
      
      // Mesmo com erro, tentar redirecionar para o dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  return {
    saveStepData,
    completeOnboarding,
  };
}
