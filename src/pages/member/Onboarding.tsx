
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingBypass } from '@/components/onboarding/OnboardingBypass';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useOnboardingLogic } from '@/hooks/onboarding/useOnboardingLogic';
import { OnboardingStepData } from '@/types/onboardingTypes';

/**
 * Página de Onboarding - FASE 3
 * Sistema completo de steps com design integrado
 */
const OnboardingContent: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useOnboardingLogic();

  const handleComplete = async (data: OnboardingStepData) => {
    console.log('🎉 Onboarding concluído com dados:', data);
    // Redirecionar para dashboard após conclusão
    navigate('/dashboard');
  };

  const handleSkip = async () => {
    console.log('⏭️ Onboarding pulado pelo usuário');
    // Redirecionar para dashboard após pular
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando setup...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingWizard 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};

const Onboarding: React.FC = () => {
  return (
    <OnboardingBypass>
      <OnboardingContent />
    </OnboardingBypass>
  );
};

export default Onboarding;
