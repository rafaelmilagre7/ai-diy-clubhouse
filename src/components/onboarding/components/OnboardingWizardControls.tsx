
import React from 'react';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { OnboardingSaveIndicator } from './OnboardingSaveIndicator';

interface OnboardingWizardControlsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => Promise<void>;
  onPrev: () => void;
  canProceed: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  syncStatus: {
    isSyncing: boolean;
    lastSyncTime: string | null;
    syncError: string | null;
  };
}

export const OnboardingWizardControls: React.FC<OnboardingWizardControlsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canProceed,
  isLoading,
  hasUnsavedChanges,
  lastSaved,
  syncStatus
}) => {
  return (
    <>
      <OnboardingNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrev={onPrev}
        canProceed={canProceed}
        isLoading={isLoading}
      />
      
      <OnboardingSaveIndicator
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        syncStatus={syncStatus}
      />
    </>
  );
};
