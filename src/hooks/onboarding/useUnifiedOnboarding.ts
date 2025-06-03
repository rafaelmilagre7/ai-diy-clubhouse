
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingProgress, OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

export const useUnifiedOnboarding = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar progresso do onboarding
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar progresso:', fetchError);
        throw fetchError;
      }

      setProgress(data);
      return data;
    } catch (err) {
      console.error('Erro ao buscar progresso do onboarding:', err);
      setError('Erro ao carregar dados do onboarding');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Função para atualizar progresso
  const updateProgress = useCallback(async (stepId: string, data: Partial<OnboardingData>) => {
    if (!user?.id || !progress) {
      throw new Error('Usuário ou progresso não encontrado');
    }

    try {
      const updatedProgress = {
        ...progress,
        ...data,
        current_step: stepId,
        completed_steps: progress.completed_steps?.includes(stepId) 
          ? progress.completed_steps 
          : [...(progress.completed_steps || []), stepId],
        updated_at: new Date().toISOString()
      };

      const { data: result, error: updateError } = await supabase
        .from('onboarding_progress')
        .update(updatedProgress)
        .eq('id', progress.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar progresso:', updateError);
        throw updateError;
      }

      setProgress(result);
      return result;
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      toast.error('Erro ao salvar progresso');
      throw err;
    }
  }, [user?.id, progress]);

  // Função para verificar se onboarding está completo
  const isOnboardingComplete = useCallback(() => {
    if (!progress) return false;

    const requiredSteps = [
      'personal_info',
      'professional_info', 
      'business_goals',
      'ai_experience'
    ];

    const hasAllSteps = requiredSteps.every(step => 
      progress.completed_steps?.includes(step)
    );

    const hasRequiredData = !!(
      progress.personal_info?.name &&
      progress.personal_info?.email &&
      progress.professional_info?.company_name &&
      progress.business_goals?.primary_goal &&
      progress.ai_experience
    );

    return progress.is_completed && hasAllSteps && hasRequiredData;
  }, [progress]);

  // Função para inicializar progresso se não existir
  const initializeProgress = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const newProgress = {
        user_id: user.id,
        current_step: 'personal_info',
        is_completed: false,
        completed_steps: [],
        personal_info: {},
        professional_info: {},
        business_goals: {},
        ai_experience: {},
        experience_personalization: {},
        complementary_info: {}
      };

      const { data, error } = await supabase
        .from('onboarding_progress')
        .insert(newProgress)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inicializar progresso:', error);
        throw error;
      }

      setProgress(data);
      return data;
    } catch (err) {
      console.error('Erro ao inicializar progresso:', err);
      throw err;
    }
  }, [user?.id]);

  // Carregar progresso inicial
  useEffect(() => {
    if (user?.id) {
      fetchProgress();
    }
  }, [user?.id, fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    updateProgress,
    isOnboardingComplete: isOnboardingComplete(),
    initializeProgress
  };
};
