
import React, { useRef } from "react";
import { useProgress } from "./useProgress"; // Corrigindo o caminho do import
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
  onboardingType = 'club'
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
  onboardingType?: 'club' | 'formacao';
}) {
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { logError, log } = useLogging();
  
  // Flag para controlar exibição de toasts
  const toastShown = React.useRef(false);
  // Flag para controlar se uma operação de salvamento está em andamento
  const isSaving = React.useRef(false);
  // Cache local para dados não salvos
  const unsavedDataCache = React.useRef<Record<string, any>>({});

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
    // Prevenir múltiplas chamadas simultâneas
    if (isSaving.current) {
      console.log("[useStepPersistenceCore] Já existe uma operação de salvamento em andamento, aguardando...");
      await new Promise(resolve => setTimeout(resolve, 300));
      if (isSaving.current) {
        console.warn("[useStepPersistenceCore] Operação de salvamento ainda em andamento após espera, ignorando nova solicitação");
        return;
      }
    }
    
    isSaving.current = true;
    
    try {
      if (!progress?.id) {
        console.error("[useStepPersistenceCore] Não foi possível salvar dados: ID de progresso não encontrado");
        toast.error("Erro ao salvar dados: ID de progresso não encontrado");
        return;
      }

      // Resetar a flag de toast ao iniciar uma nova operação de salvamento
      toastShown.current = false;

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
        console.log(`[useStepPersistenceCore] saveStepData chamado com stepId='${stepId}', shouldNavigate=${shouldNavigate}`);
      } else {
        // Caso 2: saveStepData(data: any, shouldNavigate?: boolean)
        stepId = steps[currentStepIndex]?.id || '';
        data = stepIdOrData;
        shouldNavigate = typeof dataOrShouldNavigate === 'boolean' ? 
                        dataOrShouldNavigate : true;
        console.log(`[useStepPersistenceCore] saveStepData chamado com data=objeto, shouldNavigate=${shouldNavigate}, inferindo stepId='${stepId}'`);
      }
      
      console.log(`[useStepPersistenceCore] Salvando dados do passo ${stepId}, índice ${currentStepIndex}:`, data);
      
      // Verificar se os dados são válidos
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        console.warn("[useStepPersistenceCore] Tentativa de salvar dados vazios, ignorando");
        toast.warning("Não há dados para salvar");
        return;
      }
      
      // Salvar no cache local para recuperação em caso de falha
      unsavedDataCache.current[stepId] = data;
      
      // Registrar tentativa de salvamento
      log("onboarding_save_attempt", { 
        step: stepId, 
        step_index: currentStepIndex,
      });
      
      // Montar objeto de atualização para a etapa
      const updateObj = buildUpdateObject(stepId, data, progress, currentStepIndex);
      if (Object.keys(updateObj).length === 0) {
        console.warn("[useStepPersistenceCore] Objeto de atualização vazio, nada para salvar");
        if (!toastShown.current) {
          toast.warning("Sem dados para salvar");
          toastShown.current = true;
        }
        return;
      }

      console.log("[useStepPersistenceCore] Dados a serem enviados para o banco:", updateObj);

      // Adicionar logs de debug para ajudar a rastrear problemas
      const debugLog = {
        event: "save_attempt",
        timestamp: new Date().toISOString(),
        data: {
          step_id: stepId,
          current_index: currentStepIndex,
        }
      };

      // Se já existir array de debug_logs, adicionar novo log; caso contrário, criar array
      const existingLogs = Array.isArray(progress.debug_logs) ? progress.debug_logs : [];
      const updatedLogs = [...existingLogs, debugLog].slice(-20); // manter apenas os 20 logs mais recentes
      
      // Atualizar na tabela principal com objeto tipado corretamente
      const updateWithMeta = {
        ...updateObj,
        // Garantir que campos importantes estejam sempre atualizados
        updated_at: new Date().toISOString(),
        sync_status: 'pendente',
        last_sync_at: new Date().toISOString(),
        debug_logs: updatedLogs,
        
        // Importante: Adicionar o passo atual nas etapas concluídas se ainda não estiver lá
        completed_steps: Array.isArray(progress.completed_steps) 
          ? [...new Set([...progress.completed_steps, stepId])]
          : [stepId],
        
        // Adicionando o current_step para resolver o erro de compilação
        current_step: stepId !== 'review' ? 
          (steps[currentStepIndex + 1]?.id || progress.current_step) : 
          progress.current_step
      };
      
      // Executar a atualização no banco de dados
      const result = await updateProgress(updateWithMeta);
      
      // Verificar se temos um retorno válido
      if (!result || (result as any).error) {
        const errorMessage = (result as any)?.error?.message || "Erro desconhecido ao atualizar dados";
        console.error(`[useStepPersistenceCore] Erro ao atualizar dados:`, errorMessage);
        
        logError("save_step_data_error", { 
          step: stepId, 
          error: errorMessage,
          stepIndex: currentStepIndex
        });
        
        if (!toastShown.current) {
          toast.error("Erro ao salvar dados. Por favor, tente novamente.");
          toastShown.current = true;
        }
        
        throw new Error(errorMessage);
      }
      
      // Dados salvos com sucesso, limpar do cache
      delete unsavedDataCache.current[stepId];
      
      // Notificar usuário do salvamento (apenas uma vez)
      if (!toastShown.current) {
        toast.success("Dados salvos com sucesso!");
        toastShown.current = true;
      }
      
      // Forçar atualização dos dados locais após salvar
      // Usar await para garantir que tenhamos os dados mais recentes
      const updatedProgress = await refreshProgress();
      console.log("[useStepPersistenceCore] Dados locais atualizados após salvar:", updatedProgress);
      
      // Navegação para a próxima etapa - APENAS se o refreshProgress completou com sucesso
      if (shouldNavigate && updatedProgress) {
        console.log("[useStepPersistenceCore] Navegando para a próxima etapa...");
        // Aguardar um pouco para garantir que o estado foi totalmente atualizado
        setTimeout(() => {
          // Usar o módulo de navegação por etapas, passando o tipo de onboarding
          navigateAfterStep(stepId, currentStepIndex, navigate, shouldNavigate, onboardingType);
        }, 500);
      } else {
        console.log("[useStepPersistenceCore] Permanecendo na página atual");
      }
    } catch (error: any) {
      console.error(`[useStepPersistenceCore] Erro ao salvar dados:`, error);
      logError("save_step_data_error", { 
        step: typeof stepIdOrData === 'string' ? stepIdOrData : steps[currentStepIndex]?.id || 'unknown', 
        error: error instanceof Error ? error.message : String(error),
        stepIndex: currentStepIndex
      });
      
      if (!toastShown.current) {
        toast.error("Erro ao salvar dados. Por favor, tente novamente.");
        toastShown.current = true;
      }
      
      throw error;
    } finally {
      // Garantir que o flag de salvamento seja liberado mesmo em caso de erro
      setTimeout(() => {
        isSaving.current = false;
      }, 500);
    }
  };

  return {
    saveStepData,
    completeOnboarding: async () => {
      if (!progress?.id) {
        toast.error("Progresso não encontrado. Tente recarregar a página.");
        return;
      }
      
      try {
        console.log(`[DEBUG] Completando onboarding do tipo ${onboardingType}...`);
        log("complete_onboarding_attempt", { type: onboardingType });
        
        // Marca o onboarding como concluído
        const result = await updateProgress({
          is_completed: true,
          completed_steps: steps.map(s => s.id),
          onboarding_type: onboardingType,
          current_step: 'completed',
          updated_at: new Date().toISOString()
        });
        
        if ((result as any)?.error) {
          throw new Error((result as any).error.message || "Erro ao completar onboarding");
        }
        
        // Atualiza dados locais
        await refreshProgress();
        
        log("complete_onboarding_success", { type: onboardingType });
        toast.success("Onboarding concluído com sucesso!");
        
        // Redirecionamento após delay para garantir atualização do estado
        setTimeout(() => {
          // Redirecionar para página apropriada com base no tipo de onboarding
          if (onboardingType === 'club') {
            // Adicionar parâmetro para ativar geração automática da trilha
            navigate("/onboarding/trail-generation?autoGenerate=true");
          } else {
            navigate("/learning"); // Rota para a área de aprendizado da formação
          }
        }, 1000);
      } catch (error: any) {
        console.error("[ERRO] Erro ao completar onboarding:", error);
        logError("complete_onboarding_error", { 
          error: error instanceof Error ? error.message : String(error),
          type: onboardingType 
        });
        toast.error("Erro ao finalizar onboarding. Por favor, tente novamente.");
        
        // Fallback para dashboard em caso de erro, usando navigate
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    },
    getUnsavedData: (stepId: string) => unsavedDataCache.current[stepId],
    isSavingData: () => isSaving.current
  };
}
