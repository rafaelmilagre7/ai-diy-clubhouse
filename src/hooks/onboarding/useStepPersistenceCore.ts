
import { useProgress } from "../useProgress";
import { buildUpdateObject } from "./stepDataBuilder";
import { navigateAfterStep } from "./stepNavigator";
import { steps } from "../useStepDefinitions";
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

  // Simplificando a interface para aceitar apenas um objeto de dados
  const saveStepData = async (
    data: any,
    shouldNavigate: boolean = true
  ): Promise<void> => {
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      toast.error("Erro ao salvar dados: ID de progresso não encontrado");
      return;
    }

    // Identificar qual é o passo atual baseado no currentStepIndex
    const currentStep = steps[currentStepIndex]?.id || '';
    
    console.log(`Salvando dados do passo ${currentStep}, navegação automática: ${shouldNavigate ? "SIM" : "NÃO"}`, data);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(currentStep, data, progress, currentStepIndex);
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
      
      // Notificar usuário do salvamento
      toast.success("Dados salvos com sucesso!");
      
      // Navegar para a próxima etapa apenas se solicitado
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
      console.log("Onboarding marcado como completo, gerando trilha de implementação...");
      
      toast.success("Onboarding concluído com sucesso!");
      
      // Usar setTimeout para garantir que a navegação ocorra após a atualização do estado
      setTimeout(() => {
        try {
          // Redirecionar para a página de geração de trilha com parâmetro para iniciar automaticamente
          navigate("/onboarding/trail-generation?autoGenerate=true");
        } catch (navError) {
          console.error("Erro ao navegar para a geração de trilha:", navError);
          logError("navigation_error", { 
            from: "completeOnboarding", 
            error: navError instanceof Error ? navError.message : String(navError) 
          });
          // Fallback para dashboard em caso de erro de navegação
          navigate("/dashboard");
        }
      }, 800);
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
      logError("complete_onboarding_error", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
      
      // Mesmo com erro, tentar redirecionar para o dashboard
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
