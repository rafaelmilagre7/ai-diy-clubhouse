
import React from 'react';
import { SimpleOnboardingFlow } from './SimpleOnboardingFlow';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useNavigate } from 'react-router-dom';

export const UnifiedOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen message="Carregando onboarding..." />}>
        <SimpleOnboardingFlow onComplete={handleComplete} />
      </React.Suspense>
    </ErrorBoundary>
  );
};
