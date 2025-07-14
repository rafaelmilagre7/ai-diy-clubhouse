import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import LoadingScreen from '@/components/common/LoadingScreen';

const OnboardingRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, isCompleted, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading) {
      console.log('🎯 [ONBOARDING-REDIRECT] Estado:', { isCompleted, currentStep });
      
      if (isCompleted) {
        console.log('✅ [ONBOARDING-REDIRECT] Onboarding completo, redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        const targetStep = Math.max(1, currentStep || 1);
        console.log(`🚀 [ONBOARDING-REDIRECT] Redirecionando para step ${targetStep}`);
        navigate(`/onboarding/step/${targetStep}`, { replace: true });
      }
    }
  }, [isLoading, isCompleted, currentStep, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Carregando seu onboarding..." />;
  }

  return null;
};

export default OnboardingRedirect;