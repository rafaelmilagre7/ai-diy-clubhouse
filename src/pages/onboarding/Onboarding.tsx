
import React from 'react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';

const Onboarding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <OnboardingHeader isOnboardingCompleted={false} />
      <div className="container max-w-screen-lg mx-auto py-8">
        <OnboardingSteps />
      </div>
    </div>
  );
};

export default Onboarding;
