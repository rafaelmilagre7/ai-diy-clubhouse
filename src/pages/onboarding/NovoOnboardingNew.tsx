
import React from 'react';
import { UnifiedOnboardingFlow } from '@/components/onboarding/modern/UnifiedOnboardingFlow';
import { OnboardingCompletionGuard } from '@/components/onboarding/OnboardingCompletionGuard';

const NovoOnboardingNew: React.FC = () => {
  return (
    <OnboardingCompletionGuard>
      <UnifiedOnboardingFlow />
    </OnboardingCompletionGuard>
  );
};

export default NovoOnboardingNew;
