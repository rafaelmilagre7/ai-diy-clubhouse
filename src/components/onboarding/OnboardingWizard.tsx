
import React, { useState, useCallback, memo, Suspense } from 'react';
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

// Componente de Loading memoizado
const LoadingScreen = memo(({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4" />
      <p className="text-slate-300">{message}</p>
    </div>
  </div>
));

LoadingScreen.displayName = 'LoadingScreen';

const OnboardingWizard = memo(() => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartOnboarding = useCallback(() => {
    setShowWelcome(false);
  }, []);

  if (showWelcome) {
    return (
      <OnboardingErrorBoundary>
        <Suspense fallback={<LoadingScreen message="Carregando..." />}>
          <OnboardingWizardContainer>
            {({ data, memberType, isLoading }) => {
              if (isLoading) {
                return <LoadingScreen message="Carregando..." />;
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
        </Suspense>
      </OnboardingErrorBoundary>
    );
  }

  return (
    <OnboardingErrorBoundary>
      <Suspense fallback={<LoadingScreen message="Preparando onboarding..." />}>
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
            // Loading com proteção contra renderização prematura
            if (isLoading || Object.keys(data).length <= 1) {
              return <LoadingScreen message="Preparando onboarding..." />;
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
      </Suspense>
    </OnboardingErrorBoundary>
  );
});

OnboardingWizard.displayName = 'OnboardingWizard';

export default OnboardingWizard;
