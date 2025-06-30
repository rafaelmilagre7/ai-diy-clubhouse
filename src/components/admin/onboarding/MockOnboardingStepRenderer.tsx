
import React from 'react';
import MockOnboardingStep1 from './steps/MockOnboardingStep1';
import MockOnboardingStep2 from './steps/MockOnboardingStep2';
import MockOnboardingStep3 from './steps/MockOnboardingStep3';
import MockOnboardingStep4 from './steps/MockOnboardingStep4';
import MockOnboardingStep5 from './steps/MockOnboardingStep5';
import MockOnboardingStep6 from './steps/MockOnboardingStep6';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStepRendererProps {
  currentStep: number;
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onComplete: () => Promise<void>;
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  isCompleting: boolean;
}

export const MockOnboardingStepRenderer: React.FC<MockOnboardingStepRendererProps> = ({
  currentStep,
  data,
  onUpdateData,
  onComplete,
  validationErrors,
  getFieldError,
  isCompleting
}) => {
  switch (currentStep) {
    case 1:
      return (
        <MockOnboardingStep1
          data={data}
          onUpdateData={onUpdateData}
          getFieldError={getFieldError}
        />
      );
    case 2:
      return (
        <MockOnboardingStep2
          data={data}
          onUpdateData={onUpdateData}
          getFieldError={getFieldError}
        />
      );
    case 3:
      return (
        <MockOnboardingStep3
          data={data}
          onUpdateData={onUpdateData}
          getFieldError={getFieldError}
        />
      );
    case 4:
      return (
        <MockOnboardingStep4
          data={data}
          onUpdateData={onUpdateData}
          getFieldError={getFieldError}
        />
      );
    case 5:
      return (
        <MockOnboardingStep5
          data={data}
          onUpdateData={onUpdateData}
          getFieldError={getFieldError}
        />
      );
    case 6:
      return (
        <MockOnboardingStep6
          data={data}
          onComplete={onComplete}
          isCompleting={isCompleting}
        />
      );
    default:
      return null;
  }
};
