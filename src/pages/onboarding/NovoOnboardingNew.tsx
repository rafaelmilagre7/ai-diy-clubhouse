
import React from 'react';
import { UnifiedOnboardingFlow } from '@/components/onboarding/modern/UnifiedOnboardingFlow';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

const NovoOnboardingNew = () => {
  return (
    <OnboardingLayout
      title="Configure sua experiência"
      currentStep={1}
      totalSteps={4}
      hideProgress={true}
    >
      <UnifiedOnboardingFlow />
    </OnboardingLayout>
  );
};

export default NovoOnboardingNew;
