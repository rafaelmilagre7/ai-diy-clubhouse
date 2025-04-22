
import { useProgress } from "./useProgress";
import { buildUpdateObject } from "./persistence/stepDataBuilder";
import { navigateAfterStep } from "./persistence/stepNavigator";
import { steps } from "./useStepDefinitions";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

/**
 * Hook para gerenciar a persistência de dados das etapas do onboarding
 * Fornece funções para salvar dados e completar o onboarding
 */
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

  /**
   * Função principal para salvar dados de um passo específico
   * Suporta dois formatos de chamada:
   * 1. saveStepData(stepId: string, data: any, shouldNavigate?: boolean)
   * 2. saveStepData(data: any, shouldNavigate?: boolean)
   */
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

    // Determinar os parâmetros corretos com base na assinatura usada
    let stepId: string;
    let data: any;
    let shouldNavigate: boolean = true;

    // Determinar qual formato de chamada foi utilizado
    if (typeof stepIdOrData === 'string') {
      // Caso 1: saveStepData(stepId: string, data: any, shouldNavigate?: boolean)
      stepId = stepIdOrData;
      data = dataOrShouldNavigate;
      shouldNavigate = thirdParam !== undefined ? thirdParam : true;
      console.log(`saveStepData chamado com stepId='${stepId}', data=objeto, shouldNavigate=${shouldNavigate}`);
    } else {
      // Caso 2: saveStepData(data: any, shouldNavigate?: boolean)
      stepId = steps[currentStepIndex]?.id || '';
      data = stepIdOrData;
      shouldNavigate = typeof dataOrShouldNavigate === 'boolean' ? 
                       dataOrShouldNavigate : true;
      console.log(`saveStepData chamado com data=objeto, shouldNavigate=${shouldNavigate}, inferindo stepId='${stepId}'`);
    }
    
    console.log(`Salvando dados do passo ${stepId}, índice ${currentStepIndex}:`, data);

    try {
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("Objeto de atualização vazio, nada para salvar");
        toast.warning("Sem dados para salvar");
        return;
      }

      console.log("Dados a serem enviados para o banco:", updateObj);

      // Atualizar no Supabase - Correção para tratar corretamente o retorno
      const result = await updateProgress(updateObj);
      
      // Verificar se temos um retorno válido
      if (!result || (result as any).error) {
        const errorMessage = (result as any)?.error?.message || "Erro desconhecido ao atualizar dados";
        console.error("Erro ao atualizar dados:", errorMessage);
        logError("save_step_data_error", { 
          step: stepId, 
          error: errorMessage,
          stepIndex: currentStepIndex
        });
        toast.error("Erro ao salvar dados. Por favor, tente novamente.");
        return;
      }
      
      // Usar os dados retornados ou fallback para o objeto de progresso com as atualizações
      const updatedProgress = (result as any).data || { ...progress, ...updateObj };
      console.log("Progresso atualizado com sucesso:", updatedProgress);
      
      // Notificar usuário do salvamento (apenas uma vez aqui)
      toast.success("Dados salvos com sucesso!");
      
      // Forçar atualização dos dados local após salvar
      await refreshProgress();
      
      // Navegação para a próxima etapa
      if (shouldNavigate) {
        console.log("Tentando navegar para a próxima etapa...");
        // Usar o módulo de navegação por etapas
        navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate);
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
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
      throw error;
    }
  };

  /**
   * Finaliza o onboarding, marca como completo e redireciona para a trilha de implementação
   */
  const completeOnboarding = async () => {
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
    completeOnboarding
  };
}
