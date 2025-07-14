import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import LoadingScreen from '@/components/common/LoadingScreen';

const OnboardingRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, isCompleted, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading) {
      if (isCompleted) {
        // Se já completou, vai para dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Redireciona para a etapa atual ou primeira etapa
        const targetStep = Math.max(1, currentStep || 1);
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