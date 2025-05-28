
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
        <UnifiedOnboardingFlow />
      </div>
    </OnboardingLayout>
  );
};

export default NovoOnboardingNew;
