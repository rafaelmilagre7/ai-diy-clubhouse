
import React from 'react';
import { UnifiedOnboardingFlow } from '@/components/onboarding/modern/UnifiedOnboardingFlow';
import { ModernOnboardingLayout } from '@/components/onboarding/modern/ModernOnboardingLayout';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';

const ModernOnboardingPage: React.FC = () => {
  const { currentStep, totalSteps, previousStep, canAccessStep, goToStep } = useQuickOnboardingOptimized();

  const stepTitles = [
    'Dados Pessoais',
    'Informações Profissionais',
    'Experiência com IA',
    'Revisão Final'
  ];

  const stepSubtitles = [
    'Precisamos conhecer um pouco sobre você para personalizar sua experiência',
    'Conte-nos sobre sua empresa e seu papel profissional',
    'Vamos adaptar as soluções ao seu nível de conhecimento em IA',
    'Revise suas informações e finalize seu perfil'
  ];

  return (
    <ModernOnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={currentStep > 1 ? previousStep : undefined}
      title={stepTitles[currentStep - 1] || 'Configuração do Perfil'}
      subtitle={stepSubtitles[currentStep - 1] || 'Complete seu perfil para começar'}
      canAccessStep={canAccessStep}
      onStepClick={goToStep}
    >
      <UnifiedOnboardingFlow />
    </ModernOnboardingLayout>
  );
};

export default ModernOnboardingPage;
