
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
