
import React from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';

const OnboardingPage = () => {
  const { user, isLoading } = useAuth();

  // Segurança: apenas usuários autenticados podem acessar
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <OnboardingWizard />
    </div>
  );
};

export default OnboardingPage;
