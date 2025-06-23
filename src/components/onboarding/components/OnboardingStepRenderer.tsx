
import React from 'react';
import OnboardingStep1 from '../steps/OnboardingStep1';
import OnboardingStep2 from '../steps/OnboardingStep2';
import OnboardingStep3 from '../steps/OnboardingStep3';
import OnboardingStep4 from '../steps/OnboardingStep4';
import OnboardingStep5 from '../steps/OnboardingStep5';
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
          updateData={onUpdateData}
          onUpdateData={onUpdateData}
          onNext={onNext}
          onPrev={onPrev}
          memberType={memberType}
          validationErrors={validationErrors}
          getFieldError={getFieldError}
        />
      );
    case 2:
      return (
        <OnboardingStep2
          data={data}
          updateData={onUpdateData}
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
        <OnboardingStep3
          data={data}
          updateData={onUpdateData}
          onNext={onNext}
          onPrev={onPrev}
          memberType={memberType}
          validationErrors={validationErrors}
          getFieldError={getFieldError}
        />
      );
    case 4:
      return (
        <OnboardingStep4
          data={data}
          updateData={onUpdateData}
          onUpdateData={onUpdateData}
          onNext={onNext}
          onPrev={onPrev}
          memberType={memberType}
          validationErrors={validationErrors}
          getFieldError={getFieldError}
        />
      );
    case 5:
      return (
        <OnboardingStep5
          data={data}
          updateData={onUpdateData}
          onUpdateData={onUpdateData}
          onNext={onNext}
          onPrev={onPrev}
          memberType={memberType}
          validationErrors={validationErrors}
          getFieldError={getFieldError}
        />
      );
    case 6:
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
