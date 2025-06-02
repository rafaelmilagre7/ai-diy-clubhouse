
import React from 'react';
import { SimpleOnboardingFlow } from './SimpleOnboardingFlow';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

export const UnifiedOnboardingFlow: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  return <SimpleOnboardingFlow />;
};
