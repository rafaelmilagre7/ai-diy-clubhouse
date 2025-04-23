
import { supabase } from '@/lib/supabase';

/**
 * Marca uma etapa como concluída e avança para a próxima
 */
export async function markStepAsCompleted(
  progressId: string,
  stepId: string,
  nextStepId: string,
  logError: (event: string, data?: Record<string, any>) => void
) {
  try {
    console.log(`Marcando etapa ${stepId} como concluída e avançando para ${nextStepId}`);
    
    // Buscar progresso atual primeiro
    const { data: currentProgress, error: fetchError } = await supabase
      .from('onboarding')
      .select('completed_steps')
      .eq('id', progressId)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar progresso atual:', fetchError);
      logError('mark_step_fetch_error', { error: fetchError.message });
      return { success: false, error: fetchError };
    }
    
    // Garantir que completed_steps é um array e adicionar o step atual
    const completedSteps = Array.isArray(currentProgress?.completed_steps) 
      ? [...currentProgress.completed_steps] 
      : [];
    
    // Verificar se o step já foi concluído
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }
    
    // Atualizar progresso
    const { error: updateError } = await supabase
      .from('onboarding')
      .update({
        completed_steps: completedSteps,
        current_step: nextStepId,
        updated_at: new Date().toISOString()
      })
      .eq('id', progressId);
    
    if (updateError) {
      console.error('Erro ao atualizar progresso:', updateError);
      logError('mark_step_update_error', { error: updateError.message });
      return { success: false, error: updateError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exceção ao marcar etapa como concluída:', error);
    logError('mark_step_exception', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return { success: false, error };
  }
}
