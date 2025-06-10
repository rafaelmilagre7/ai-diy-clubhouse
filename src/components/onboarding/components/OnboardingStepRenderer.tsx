
import React from 'react';
import OnboardingStep1 from '../steps/OnboardingStep1';
import OnboardingStep3 from '../steps/OnboardingStep3';
import { OnboardingFinal } from '../steps/OnboardingFinal';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingStepRendererProps {
  currentStep: number;
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  onComplete: () => Promise<void>;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  isCompleting: boolean;
}

export const OnboardingStepRenderer: React.FC<OnboardingStepRendererProps> = ({
  currentStep,
  data,
  onUpdateData,
  onNext,
  onPrev,
  onComplete,
  memberType,
  validationErrors,
  getFieldError,
  isCompleting
}) => {
  switch (currentStep) {
    case 1:
      return (
        <OnboardingStep1
          data={data}
          onUpdateData={onUpdateData}
          onNext={onNext}
          memberType={memberType}
          validationErrors={validationErrors}
          getFieldError={getFieldError}
        />
      );
    case 2:
      return (
        <OnboardingStep3
          data={data}
          onUpdateData={onUpdateData}
          onNext={onNext}
          onPrev={onPrev}
          memberType={memberType}
          validationErrors={validationErrors}
          getFieldError={getFieldError}
        />
      );
    case 3:
      return (
        <OnboardingFinal
          data={data}
          onComplete={onComplete}
          memberType={memberType}
          isCompleting={isCompleting}
        />
      );
    default:
      return null;
  }
};
