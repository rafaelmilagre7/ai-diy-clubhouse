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

    // 1. Primeiro verificar se existe registro de onboarding
    const { data: existingOnboarding } = await supabase
      .from('onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingOnboarding) {
      console.log('📝 [FIX] Criando registro de onboarding completo...');
      // Criar registro de onboarding completo
      const { error: createError } = await supabase
        .from('onboarding')
        .insert({
          user_id: user.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 7,
          completed_steps: [1, 2, 3, 4, 5, 6]
        });

      if (createError) {
        console.error('❌ [FIX] Erro ao criar onboarding:', createError);
        return false;
      }
    } else {
      console.log('📝 [FIX] Atualizando registro de onboarding existente...');
      // Atualizar registro existente
      const { error: onboardingError } = await supabase
        .from('onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          current_step: 7,
          completed_steps: [1, 2, 3, 4, 5, 6]
        })
        .eq('user_id', user.id);

      if (onboardingError) {
        console.error('❌ [FIX] Erro ao atualizar onboarding:', onboardingError);
        return false;
      }
    }

    // 2. Atualizar profile para marcar onboarding como completo
    console.log('👤 [FIX] Atualizando profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('❌ [FIX] Erro ao atualizar profile:', profileError);
      return false;
    }

    console.log('✅ [FIX] Onboarding corrigido com sucesso!');
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