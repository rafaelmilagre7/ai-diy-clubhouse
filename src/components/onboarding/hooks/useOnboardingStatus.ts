
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { getUserRoleName } from '@/lib/supabase/types';

export const useOnboardingStatus = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading || !user) {
        setIsLoading(true);
        return;
      }

      try {
        console.log('[OnboardingStatus] Verificando status para usuário:', user.id);
        
        // CORREÇÃO DE SEGURANÇA: Verificação de admin APENAS via banco de dados
        const userRole = getUserRoleName(profile);
        const isAdmin = userRole === 'admin';

        console.log('[OnboardingStatus] Role do usuário:', userRole, 'É admin:', isAdmin);

        // Admins não precisam de onboarding
        if (isAdmin) {
          console.log('[OnboardingStatus] Admin detectado - onboarding não necessário');
          setIsRequired(false);
          setHasCompleted(true);
          setIsLoading(false);
          return;
        }

        // Verificar se o usuário já completou o onboarding
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('completed_at, user_id')
          .eq('user_id', user.id as any)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('[OnboardingStatus] Erro ao verificar onboarding:', error);
          setIsRequired(true);
          setHasCompleted(false);
        } else {
          const completed = !!(onboardingData as any)?.completed_at;
          console.log('[OnboardingStatus] Dados do onboarding encontrados:', !!onboardingData, 'Completado:', completed);
          
          setHasCompleted(completed);
          setIsRequired(!completed);
        }
      } catch (error) {
        console.error('[OnboardingStatus] Erro ao verificar status do onboarding:', error);
        setIsRequired(true);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, profile, authLoading]);

  console.log('[OnboardingStatus] Estado atual:', {
    isLoading,
    isRequired,
    hasCompleted,
    userId: user?.id,
    userRole: getUserRoleName(profile)
  });

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
