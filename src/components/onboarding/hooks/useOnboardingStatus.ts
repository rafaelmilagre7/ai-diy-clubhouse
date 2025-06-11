
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
        // CORREÇÃO DE SEGURANÇA: Verificação de admin APENAS via banco de dados
        const userRole = getUserRoleName(profile);
        const isAdmin = userRole === 'admin';

        // Admins não precisam de onboarding
        if (isAdmin) {
          setIsRequired(false);
          setHasCompleted(true);
          setIsLoading(false);
          return;
        }

        // Verificar se o usuário já completou o onboarding
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('completed_at')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar onboarding:', error);
          setIsRequired(true);
          setHasCompleted(false);
        } else {
          const completed = !!onboardingData?.completed_at;
          setHasCompleted(completed);
          setIsRequired(!completed);
        }
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        setIsRequired(true);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, profile, authLoading]);

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
