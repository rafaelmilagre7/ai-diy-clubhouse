
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingGuardProps {
  children: React.ReactNode;
  requireCompleted?: boolean;
  redirectTo?: string;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({
  children,
  requireCompleted = false,
  redirectTo
}) => {
  const { isOnboardingComplete, isLoading } = useUnifiedOnboardingValidation();

  if (isLoading) {
    return <LoadingScreen message="Verificando onboarding..." />;
  }

  if (requireCompleted && !isOnboardingComplete) {
    return <Navigate to={redirectTo || '/onboarding-new'} replace />;
  }

  if (!requireCompleted && isOnboardingComplete) {
    return <Navigate to={redirectTo || '/dashboard'} replace />;
  }

  return <>{children}</>;
};
