
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

/**
 * Atualiza o status do progresso de onboarding
 */
export async function updateOnboardingProgressStatus(
  progressId: string,
  statusUpdate: {
    is_completed?: boolean;
    completed_steps?: string[];
  },
  logError: ReturnType<typeof useLogging>["logError"]
) {
  try {
    console.log(`Atualizando status de progresso ${progressId}:`, statusUpdate);
    
    const { data, error } = await supabase
      .from('onboarding_progress')
      .update(statusUpdate)
      .eq('id', progressId)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar status de progresso:', error);
      logError('update_progress_status_error', { error: error.message });
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exceção ao atualizar status de progresso:', error);
    logError('update_progress_status_exception', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return { success: false, error };
  }
}

/**
 * Marca uma etapa como concluída e atualiza o progresso
 */
export async function markStepAsCompleted(
  progressId: string,
  stepId: string,
  nextStepId: string | null,
  logError: ReturnType<typeof useLogging>["logError"]
) {
  try {
    console.log(`Marcando etapa ${stepId} como concluída no progresso ${progressId}`);
    
    // Buscar o progresso atual para obter as etapas já concluídas
    const { data: currentProgress, error: fetchError } = await supabase
      .from('onboarding_progress')
      .select('completed_steps, current_step')
      .eq('id', progressId)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar progresso atual:', fetchError);
      logError('mark_step_completed_fetch_error', { error: fetchError.message });
      return { success: false, error: fetchError };
    }
    
    // Preparar as etapas concluídas
    const completedSteps = Array.isArray(currentProgress.completed_steps) 
      ? [...currentProgress.completed_steps] 
      : [];
    
    // Adicionar a etapa atual se ainda não estiver na lista
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }
    
    // Preparar a atualização
    const updateData: any = {
      completed_steps: completedSteps
    };
    
    // Atualizar a próxima etapa, se fornecida
    if (nextStepId) {
      updateData.current_step = nextStepId;
    }
    
    // Atualizar o progresso
    const { data, error } = await supabase
      .from('onboarding_progress')
      .update(updateData)
      .eq('id', progressId)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao marcar etapa como concluída:', error);
      logError('mark_step_completed_error', { error: error.message });
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exceção ao marcar etapa como concluída:', error);
    logError('mark_step_completed_exception', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return { success: false, error };
  }
}
