
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OnboardingStatus {
  hasQuickOnboarding: boolean;
  hasOnboardingProgress: boolean;
  isCompleted: boolean;
  needsRedirect: boolean;
  redirectPath: string | null;
}

export const useOnboardingFlow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus>({
    hasQuickOnboarding: false,
    hasOnboardingProgress: false,
    isCompleted: false,
    needsRedirect: false,
    redirectPath: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Verificando status do onboarding...');

      // Verificar quick_onboarding
      const { data: quickData } = await supabase
        .from('quick_onboarding')
        .select('is_completed, current_step')
        .eq('user_id', user.id)
        .single();

      // Verificar onboarding_progress
      const { data: progressData } = await supabase
        .from('onboarding_progress')
        .select('is_completed, current_step')
        .eq('user_id', user.id)
        .single();

      const hasQuickOnboarding = !!quickData;
      const hasOnboardingProgress = !!progressData;
      const isCompleted = quickData?.is_completed || progressData?.is_completed || false;

      // Determinar se precisa redirecionar
      let needsRedirect = false;
      let redirectPath: string | null = null;

      if (!isCompleted) {
        // Se não tem nenhum onboarding, ir para novo onboarding
        if (!hasQuickOnboarding && !hasOnboardingProgress) {
          needsRedirect = true;
          redirectPath = '/onboarding-new';
        }
        // Se tem quick_onboarding incompleto, continuar
        else if (hasQuickOnboarding && !quickData.is_completed) {
          needsRedirect = true;
          redirectPath = '/onboarding-new';
        }
        // Se tem onboarding_progress incompleto, continuar
        else if (hasOnboardingProgress && !progressData.is_completed) {
          needsRedirect = true;
          redirectPath = '/onboarding-new';
        }
      }

      const newStatus = {
        hasQuickOnboarding,
        hasOnboardingProgress,
        isCompleted,
        needsRedirect,
        redirectPath
      };

      console.log('📊 Status do onboarding:', newStatus);
      setStatus(newStatus);

    } catch (error) {
      console.error('❌ Erro ao verificar onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const redirectToOnboarding = useCallback(() => {
    if (status.needsRedirect && status.redirectPath) {
      console.log(`🔄 Redirecionando para: ${status.redirectPath}`);
      navigate(status.redirectPath);
    }
  }, [status.needsRedirect, status.redirectPath, navigate]);

  const forceCompleteOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    try {
      console.log('🚀 Forçando conclusão do onboarding...');

      // Marcar quick_onboarding como completo
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          is_completed: true,
          current_step: 4,
          name: profile?.name || user.email || 'Usuário',
          email: user.email || '',
          updated_at: new Date().toISOString()
        });

      if (quickError) {
        console.error('❌ Erro ao atualizar quick_onboarding:', quickError);
        throw quickError;
      }

      // Atualizar status local
      setStatus(prev => ({ ...prev, isCompleted: true, needsRedirect: false }));
      toast.success('Onboarding marcado como concluído');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao forçar conclusão:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    }
  }, [user?.id, user?.email, profile?.name]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    status,
    isLoading,
    checkOnboardingStatus,
    redirectToOnboarding,
    forceCompleteOnboarding
  };
};
