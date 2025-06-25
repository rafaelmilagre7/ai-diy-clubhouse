
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
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  disabled?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
}

export const OnboardingStepRenderer: React.FC<OnboardingStepRendererProps> = ({
  currentStep,
  data,
  onUpdateData,
  memberType,
  validationErrors,
  getFieldError,
  disabled = false,
  readOnly = false,
  isLoading = false
}) => {
  const stepProps = {
    data,
    onUpdateData,
    memberType,
    validationErrors,
    getFieldError,
    disabled,
    readOnly,
    isLoading
  };

  switch (currentStep) {
    case 1:
      return (
        <OnboardingStep1
          {...stepProps}
          onNext={() => {}}
          onPrev={() => {}}
        />
      );
    case 2:
      return (
        <OnboardingStep2
          {...stepProps}
          onNext={() => {}}
          onPrev={() => {}}
        />
      );
    case 3:
      return (
        <OnboardingStep3
          {...stepProps}
          onNext={() => {}}
          onPrev={() => {}}
        />
      );
    case 4:
      return (
        <OnboardingStep4
          {...stepProps}
          onNext={() => {}}
          onPrev={() => {}}
        />
      );
    case 5:
      return (
        <OnboardingStep5
          {...stepProps}
          onNext={() => {}}
          onPrev={() => {}}
        />
      );
    case 6:
      return (
        <OnboardingFinal
          data={data}
          onComplete={() => {}}
          memberType={memberType}
          isCompleting={false}
        />
      );
    default:
      return null;
  }
};
