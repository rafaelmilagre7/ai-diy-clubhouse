
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { getUserRoleName } from '@/lib/supabase/types';

export const useOnboardingRequired = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingRequirement = async () => {
      if (authLoading || !user) {
        setIsLoading(true);
        return;
      }

      try {
        console.log('[ONBOARDING-REQUIRED] Verificando necessidade de onboarding para:', user.id);
        
        // Verificar se é admin - admins não precisam de onboarding
        const userRole = getUserRoleName(profile);
        const isAdmin = userRole === 'admin';

        console.log('[ONBOARDING-REQUIRED] Role do usuário:', userRole, 'É admin:', isAdmin);

        if (isAdmin) {
          console.log('[ONBOARDING-REQUIRED] Admin detectado - onboarding não necessário');
          setIsRequired(false);
          setHasCompleted(true);
          setIsLoading(false);
          return;
        }

        // Verificar se já completou onboarding
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('completed_at, user_id')
          .eq('user_id', user.id as any)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('[ONBOARDING-REQUIRED] Erro ao verificar onboarding:', error);
          // Em caso de erro, assumir que precisa fazer onboarding
          setIsRequired(true);
          setHasCompleted(false);
        } else {
          const completed = !!(onboardingData as any)?.completed_at;
          console.log('[ONBOARDING-REQUIRED] Dados encontrados:', !!onboardingData, 'Completado:', completed);
          
          setHasCompleted(completed);
          setIsRequired(!completed);
        }
      } catch (error) {
        console.error('[ONBOARDING-REQUIRED] Erro ao verificar necessidade de onboarding:', error);
        // Em caso de erro, assumir que precisa fazer onboarding por segurança
        setIsRequired(true);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingRequirement();
  }, [user, profile, authLoading]);

  console.log('[ONBOARDING-REQUIRED] Estado atual:', {
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
