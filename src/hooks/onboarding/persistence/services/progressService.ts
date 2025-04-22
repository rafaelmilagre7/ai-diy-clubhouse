
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

/**
 * Atualiza o progresso geral do onboarding (etapa atual, etapas concluídas)
 */
export const updateOnboardingProgressStatus = async (
  progressId: string,
  updates: {
    current_step?: string;
    completed_steps?: string[];
    is_completed?: boolean;
  },
  logError: ReturnType<typeof useLogging>["logError"]
) => {
  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para atualização de status");
    return { success: false, error: "ID de progresso não fornecido" };
  }

  try {
    // Filtrar apenas campos válidos para atualização
    const validUpdates: any = {};
    
    if (updates.current_step !== undefined) {
      validUpdates.current_step = updates.current_step;
    }
    
    if (updates.completed_steps !== undefined) {
      // Garantir que completed_steps é um array
      if (Array.isArray(updates.completed_steps)) {
        validUpdates.completed_steps = updates.completed_steps;
      } else {
        console.error("[ERRO] completed_steps não é um array:", updates.completed_steps);
      }
    }
    
    if (updates.is_completed !== undefined) {
      validUpdates.is_completed = updates.is_completed;
    }
    
    validUpdates.updated_at = new Date().toISOString();

    // Registrar o que será atualizado
    console.log("[DEBUG] Atualizando status do progresso:", validUpdates);

    const { data, error } = await supabase
      .from("onboarding_progress")
      .update(validUpdates)
      .eq("id", progressId)
      .select()
      .single();

    if (error) {
      console.error("[ERRO] Erro ao atualizar status de progresso:", error);
      logError("update_progress_status_error", {
        error: error.message,
        progressId,
        updates: validUpdates
      });
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[ERRO] Exceção ao atualizar status de progresso:", err);
    logError("update_progress_status_exception", {
      error: err instanceof Error ? err.message : String(err),
      progressId
    });
    return { success: false, error: err };
  }
};

/**
 * Marca uma etapa específica como concluída
 */
export const markStepAsCompleted = async (
  progressId: string,
  stepId: string,
  nextStep: string | null,
  logError: ReturnType<typeof useLogging>["logError"]
) => {
  try {
    // Primeiro, buscar o progresso atual para obter as etapas já concluídas
    const { data: currentProgress, error: fetchError } = await supabase
      .from("onboarding_progress")
      .select("completed_steps")
      .eq("id", progressId)
      .single();

    if (fetchError) {
      console.error("[ERRO] Erro ao buscar progresso atual:", fetchError);
      return { success: false, error: fetchError };
    }

    // Garantir que completed_steps é um array
    let completedSteps = Array.isArray(currentProgress.completed_steps) 
      ? currentProgress.completed_steps 
      : [];
      
    // Adicionar o stepId se ainda não estiver presente
    if (!completedSteps.includes(stepId)) {
      completedSteps = [...completedSteps, stepId];
    }

    // Preparar atualizações
    const updates: any = {
      completed_steps: completedSteps
    };

    // Adicionar próxima etapa se fornecida
    if (nextStep) {
      updates.current_step = nextStep;
    }

    // Atualizar o progresso
    return await updateOnboardingProgressStatus(progressId, updates, logError);
  } catch (err) {
    console.error("[ERRO] Exceção ao marcar etapa como concluída:", err);
    logError("mark_step_completed_exception", {
      error: err instanceof Error ? err.message : String(err),
      progressId,
      stepId
    });
    return { success: false, error: err };
  }
};
