
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const OnboardingProtectedRoute: React.FC<OnboardingProtectedRouteProps> = ({
  children,
  fallbackPath = '/onboarding-new'
}) => {
  const { data: completionData, isLoading } = useOnboardingCompletion();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-400">Verificando status do onboarding...</p>
      </div>
    );
  }

  const isOnboardingComplete = completionData?.isCompleted || false;

  if (!isOnboardingComplete) {
    console.log("[OnboardingProtectedRoute] Onboarding incompleto, redirecionando para", fallbackPath);
    console.log("[OnboardingProtectedRoute] Dados:", completionData);
    return <Navigate to={fallbackPath} replace />;
  }

  console.log("[OnboardingProtectedRoute] Onboarding completo, permitindo acesso");
  return <>{children}</>;
};
