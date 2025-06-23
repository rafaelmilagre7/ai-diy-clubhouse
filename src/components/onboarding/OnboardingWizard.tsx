
import React, { useState } from 'react';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingErrorBoundary } from './components/OnboardingErrorBoundary';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const stepTitles = [
  'Informações Pessoais',
  'Perfil Empresarial', 
  'Maturidade em IA',
  'Objetivos e Expectativas',
  'Personalização da Experiência',
  'Finalização'
];

const OnboardingWizard = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartOnboarding = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <OnboardingErrorBoundary>
        <OnboardingWizardContainer>
          {({ data, memberType, isLoading }) => {
            if (isLoading) {
              return (
                <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
                    <p className="text-slate-300">Carregando...</p>
                  </div>
                </div>
              );
            }

            return (
              <OnboardingWelcome
                userName={data.name}
                memberType={memberType || 'club'}
                fromInvite={(data as any).fromInvite}
                onStart={handleStartOnboarding}
              />
            );
          }}
        </OnboardingWizardContainer>
      </OnboardingErrorBoundary>
    );
  }

  return (
    <OnboardingErrorBoundary>
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
          handleNext,
          handlePrevious,
          handleDataChange,
          handleSubmit,
          isCurrentStepValid,
          totalSteps,
          completionError
        }) => {
          // Loading melhorado com proteção contra renderização prematura
          if (isLoading || Object.keys(data).length <= 1) {
            return (
              <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
                  <p className="text-slate-300">Preparando onboarding...</p>
                </div>
              </div>
            );
          }

          return (
            <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823]">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                  <OnboardingProgress 
                    currentStep={currentStep} 
                    totalSteps={totalSteps}
                    stepTitles={stepTitles}
                  />
                  
                  <Card className="mt-8 p-8 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
                    {/* Erro de finalização */}
                    {completionError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {completionError}
                        </AlertDescription>
                      </Alert>
                    )}

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
                    
                    {currentStep < totalSteps ? (
                      <OnboardingWizardControls
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        onNext={handleNext}
                        onPrev={handlePrevious}
                        canProceed={isCurrentStepValid}
                        isLoading={isSubmitting}
                        hasUnsavedChanges={hasUnsavedChanges}
                        lastSaved={lastSaved}
                        syncStatus={{
                          isSyncing: false,
                          lastSyncTime: lastSaved?.toISOString() || '',
                          syncError: completionError || ''
                        }}
                      />
                    ) : null}
                  </Card>
                </div>
              </div>
            </div>
          );
        }}
      </OnboardingWizardContainer>
    </OnboardingErrorBoundary>
  );
};

export default OnboardingWizard;
