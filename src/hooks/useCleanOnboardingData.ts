
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { logger } from '@/utils/logger';

export const useCleanOnboardingData = () => {
  const { user, profile, isLoading } = useSimpleAuth();
  const [cleanData, setCleanData] = useState(() => ({
    user,
    profile,
    isLoading,
    shouldShowOnboarding: !profile?.onboarding_completed
  }));

  useEffect(() => {
    logger.info('[CLEAN-ONBOARDING-DATA] 📡 Dados limpos atualizados', {
      component: 'useCleanOnboardingData',
      action: 'data_updated',
      hasUser: !!user,
      hasProfile: !!profile,
      shouldShowOnboarding: !profile?.onboarding_completed
    });

    setCleanData({
      user,
      profile,
      isLoading,
      shouldShowOnboarding: !profile?.onboarding_completed
    });
  }, [user, profile, isLoading]);

  return cleanData;
};
