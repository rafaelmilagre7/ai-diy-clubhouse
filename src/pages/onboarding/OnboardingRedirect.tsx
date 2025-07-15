import React, { useEffect } from 'react';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';
import LoadingScreen from '@/components/common/LoadingScreen';

const OnboardingRedirect: React.FC = () => {
  const { redirectToNextStep } = useOnboardingRedirect();

  useEffect(() => {
    redirectToNextStep();
  }, [redirectToNextStep]);

  return <LoadingScreen message="Determinando próximo passo..." />;
};

export default OnboardingRedirect;