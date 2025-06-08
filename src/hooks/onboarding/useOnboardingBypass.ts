
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getOnboardingAction, logOnboardingDecision } from './utils/onboardingUtils';

/**
 * Hook para gerenciar lógica de bypass do onboarding
 * FASE 2: Sistema inteligente de decisão
 */
export const useOnboardingBypass = () => {
  const { user, profile, isLoading } = useAuth();
  const [bypassAction, setBypassAction] = useState<'bypass' | 'required' | 'suggested' | 'optional' | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsChecking(true);
      return;
    }

    if (!user || !profile) {
      setBypassAction(null);
      setIsChecking(false);
      return;
    }

    const action = getOnboardingAction(user.email, profile);
    logOnboardingDecision(user.email, profile, action);
    
    setBypassAction(action);
    setIsChecking(false);
  }, [user, profile, isLoading]);

  return {
    bypassAction,
    isChecking,
    shouldBypass: bypassAction === 'bypass',
    shouldShow: bypassAction === 'required',
    isOptional: bypassAction === 'optional',
    isSuggested: bypassAction === 'suggested',
    user,
    profile
  };
};
