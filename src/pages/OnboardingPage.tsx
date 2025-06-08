
import React from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { OnboardingLoader } from '@/components/onboarding/components/OnboardingLoader';

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <OnboardingLoader>
        <OnboardingWizard />
      </OnboardingLoader>
    </div>
  );
};

export default OnboardingPage;
