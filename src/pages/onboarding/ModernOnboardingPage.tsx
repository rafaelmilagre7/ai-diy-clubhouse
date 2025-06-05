
import React from 'react';
import { UnifiedOnboardingFlow } from '@/components/onboarding/modern/UnifiedOnboardingFlow';
import { ModernOnboardingLayout } from '@/components/onboarding/modern/ModernOnboardingLayout';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';

const ModernOnboardingPage: React.FC = () => {
  const { currentStep, totalSteps, previousStep } = useQuickOnboardingOptimized();

  const stepTitles = [
    'Conte-nos sobre você',
    'Dados da sua empresa',
    'Sua experiência com IA',
    'Quase pronto!'
  ];

  const stepSubtitles = [
    'Precisamos conhecer um pouco sobre você para personalizar sua experiência',
    'Entenda como nossa plataforma pode transformar seu negócio',
    'Vamos adaptar as soluções ao seu nível de conhecimento',
    'Revise suas informações e finalize seu perfil'
  ];

  return (
    <ModernOnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={currentStep > 1 ? previousStep : undefined}
      title={stepTitles[currentStep - 1] || 'Configuração do Perfil'}
      subtitle={stepSubtitles[currentStep - 1] || 'Complete seu perfil para começar'}
    >
      <UnifiedOnboardingFlow />
    </ModernOnboardingLayout>
  );
};

export default ModernOnboardingPage;
