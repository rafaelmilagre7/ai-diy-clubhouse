
import React from 'react';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import MemberLayout from '@/components/layout/MemberLayout';

const Onboarding: React.FC = () => {
  const { currentStepIndex, steps, navigateToStep } = useOnboardingSteps();
  
  return (
    <MemberLayout>
      <div className="container max-w-screen-lg mx-auto py-8">
        <OnboardingHeader isOnboardingCompleted={false} />
        
        <div className="mt-6">
          <EtapasProgresso 
            currentStep={currentStepIndex + 1} 
            totalSteps={steps.length} 
            onStepClick={navigateToStep}
          />
        </div>
        
        <div className="mt-8">
          <OnboardingSteps />
        </div>
      </div>
    </MemberLayout>
  );
};

export default Onboarding;
