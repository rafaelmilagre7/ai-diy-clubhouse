
import React from 'react';
import { SimpleOnboardingFlow } from './SimpleOnboardingFlow';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingScreen from '@/components/common/LoadingScreen';

export const UnifiedOnboardingFlow: React.FC = () => {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen message="Carregando onboarding..." />}>
        <SimpleOnboardingFlow />
      </React.Suspense>
    </ErrorBoundary>
  );
};
