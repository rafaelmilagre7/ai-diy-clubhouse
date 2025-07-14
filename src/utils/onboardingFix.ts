import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProgress {
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
}

/**
 * Corrige o usuário atual marcando onboarding como completo
 */
export const fixCurrentUserOnboarding = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    console.log('🔧 [FIX] Corrigindo onboarding para usuário:', user.id);

    // 1. Marcar onboarding como completo
    const { error: onboardingError } = await supabase
      .from('onboarding')
      .update({ 
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_completed', false);

    if (onboardingError) {
      console.error('❌ [FIX] Erro ao atualizar onboarding:', onboardingError);
    }

    // 2. Sincronizar profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .eq('onboarding_completed', false);

    if (profileError) {
      console.error('❌ [FIX] Erro ao atualizar profiles:', profileError);
    }

    console.log('✅ [FIX] Correção aplicada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error);
    return false;
  }
};

/**
 * Verifica progresso real do onboarding na tabela
 */
export const getOnboardingProgress = async (userId: string): Promise<OnboardingProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('onboarding')
      .select('current_step, completed_steps, is_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [PROGRESS] Erro ao verificar progresso:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ [PROGRESS] Erro inesperado:', error);
    return null;
  }
};

/**
 * Determina próximo step baseado no progresso real
 */
export const getNextOnboardingStep = (progress: OnboardingProgress): number => {
  if (progress.is_completed) {
    return 7; // Onboarding completo
  }

  if (progress.completed_steps.length === 0) {
    return 1; // Nenhum step completo
  }

  // Próximo step após o último completo
  const maxCompletedStep = Math.max(...progress.completed_steps);
  return Math.min(maxCompletedStep + 1, 6);
};