
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { logger } from '@/utils/logger';

// Utility functions for onboarding validation
const OnboardingValidator = {
  isRequired: (profile: any) => {
    if (!profile) return true;
    return !profile.onboarding_completed;
  },
  
  isCompleted: (profile: any) => {
    if (!profile) return false;
    return Boolean(profile.onboarding_completed);
  }
};

export const useOnboardingRequired = () => {
  const { user, profile, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const [state, setState] = useState({
    isRequired: false,
    hasCompleted: false,
    isLoading: true
  });

  useEffect(() => {
    logger.info('[ONBOARDING-REQUIRED] 📊 Atualizando estado baseado em SimpleAuth');

    // Se ainda está carregando auth, manter loading
    if (authLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // CORREÇÃO CRÍTICA: Admin NUNCA precisa de onboarding
    if (isAdmin) {
      logger.info('[ONBOARDING-REQUIRED] 👑 ADMIN DETECTADO - Onboarding dispensado', {
        userId: user?.id?.substring(0, 8) + '***' || 'none',
        isAdmin: isAdmin,
        profileCompleted: profile?.onboarding_completed
      });

      setState({
        isRequired: false, // SEMPRE false para admin
        hasCompleted: true, // SEMPRE true para admin
        isLoading: false
      });
      return;
    }

    // Para não-admin, usar validação normal
    const isRequired = OnboardingValidator.isRequired(profile);
    const hasCompleted = OnboardingValidator.isCompleted(profile);

    logger.info('[ONBOARDING-REQUIRED] 📊 Estado atualizado:', {
      isRequired,
      hasCompleted,
      isAdmin,
      hasUser: !!user,
      userRole: profile?.user_roles?.name,
      onboardingCompleted: profile?.onboarding_completed
    });

    setState({
      isRequired,
      hasCompleted,
      isLoading: false
    });
  }, [user, profile, authLoading, isAdmin]);

  logger.debug('[ONBOARDING-REQUIRED] 📊 Estado atual:', {
    isRequired: state.isRequired,
    hasCompleted: state.hasCompleted,
    isLoading: state.isLoading
  });

  return state;
};
