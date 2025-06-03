
import React from 'react';
import { UnifiedOnboardingFlow } from '@/components/onboarding/modern/UnifiedOnboardingFlow';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

const NovoOnboardingNew = () => {
  return (
    <OnboardingLayout
      title="Configuração do Perfil"
      currentStep={1}
      totalSteps={4}
      hideProgress={false}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bem-vindo ao <span className="text-viverblue">VIVER DE IA</span>
          </h1>
          <p className="text-lg text-gray-300">
            Vamos conhecer você melhor para criar sua experiência personalizada
          </p>
        </div>
        
        <UnifiedOnboardingFlow />
      </div>
    </OnboardingLayout>
  );
};

export default NovoOnboardingNew;
