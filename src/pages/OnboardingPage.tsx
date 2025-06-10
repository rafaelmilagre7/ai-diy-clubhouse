
import React from 'react';
import { OnboardingLoader } from '@/components/onboarding/components/OnboardingLoader';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

const OnboardingPage = () => {
  return (
    <OnboardingLoader>
      <OnboardingWizard />
    </OnboardingLoader>
  );
};

export default OnboardingPage;
