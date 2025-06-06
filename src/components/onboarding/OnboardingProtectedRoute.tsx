
import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const OnboardingProtectedRoute: React.FC<OnboardingProtectedRouteProps> = ({
  children,
  fallbackPath = '/dashboard'
}) => {
  // TEMPORÁRIO: Sempre permite acesso - onboarding desabilitado
  console.log("[OnboardingProtectedRoute] Onboarding protection disabled, allowing access");
  return <>{children}</>;
};
