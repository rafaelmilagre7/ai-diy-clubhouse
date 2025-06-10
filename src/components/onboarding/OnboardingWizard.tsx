
import React from 'react';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { Card } from '@/components/ui/card';

const stepTitles = [
  'Informações Pessoais',
  'Perfil de IA',
  'Finalização'
];

const OnboardingWizard = () => {
  return (
    <OnboardingWizardContainer>
      {({
        currentStep,
        isSubmitting,
        data,
        isLoading,
        lastSaved,
        hasUnsavedChanges,
        validationErrors,
        getFieldError,
        syncStatus,
        handleNext,
        handlePrevious,
        handleDataChange,
        handleSubmit,
        isCurrentStepValid,
        totalSteps
      }) => {
        if (isLoading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <OnboardingProgress 
                  currentStep={currentStep} 
                  totalSteps={totalSteps}
                  stepTitles={stepTitles}
                />
                
                <Card className="mt-8 p-8">
                  <OnboardingStepRenderer
                    currentStep={currentStep}
                    data={data}
                    onUpdateData={handleDataChange}
                    onNext={handleNext}
                    onPrev={handlePrevious}
                    onComplete={handleSubmit}
                    memberType={data.memberType || 'club'}
                    validationErrors={validationErrors}
                    getFieldError={getFieldError}
                    isCompleting={isSubmitting}
                  />
                  
                  {currentStep < totalSteps && (
                    <OnboardingWizardControls
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                      onNext={handleNext}
                      onPrev={handlePrevious}
                      canProceed={isCurrentStepValid}
                      isLoading={isSubmitting}
                      hasUnsavedChanges={hasUnsavedChanges}
                      lastSaved={lastSaved}
                      syncStatus={syncStatus}
                    />
                  )}
                </Card>
                
                {currentStep < totalSteps && (
                  <OnboardingWizardControls
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={handleNext}
                    onPrev={handlePrevious}
                    canProceed={isCurrentStepValid}
                    isLoading={isSubmitting}
                    hasUnsavedChanges={hasUnsavedChanges}
                    lastSaved={lastSaved}
                    syncStatus={syncStatus}
                  />
                )}
              </div>
            </div>
          </div>
        );
      }}
    </OnboardingWizardContainer>
  );
};

export default OnboardingWizard;
