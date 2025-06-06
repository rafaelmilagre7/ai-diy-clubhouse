
import React from 'react';

interface OnboardingValidatorProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export const OnboardingValidator: React.FC<OnboardingValidatorProps> = ({
  children,
  requireOnboarding = false, // Desabilitado por padrão
  redirectTo = '/dashboard'
}) => {
  // TEMPORÁRIO: Sempre permite acesso - onboarding desabilitado
  console.log("[OnboardingValidator] Onboarding validation disabled, allowing access");
  return <>{children}</>;
};
