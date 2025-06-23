
import React, { useState, useCallback, memo, Suspense } from 'react';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingErrorBoundary } from './components/OnboardingErrorBoundary';
import { OnboardingLoadingState } from './components/OnboardingLoadingStates';
import { OnboardingErrorHandler } from './components/OnboardingErrorHandler';
import { Card } from '@/components/ui/card';

const stepTitles = [
  'Informações Pessoais',
  'Perfil Empresarial', 
  'Maturidade em IA',
  'Objetivos e Expectativas',
  'Personalização da Experiência',
  'Finalização'
];

const OnboardingWizard = memo(() => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartOnboarding = useCallback(() => {
    setShowWelcome(false);
  }, []);

  if (showWelcome) {
    return (
      <OnboardingErrorBoundary>
        <Suspense fallback={<OnboardingLoadingState type="verification" />}>
          <OnboardingWizardContainer>
            {({ data, memberType, isLoading }) => {
              if (isLoading) {
                return <OnboardingLoadingState type="preparation" message="Configurando sua experiência personalizada..." />;
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
      <Suspense fallback={<OnboardingLoadingState type="initialization" />}>
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
            // Loading com mensagens específicas
            if (isLoading) {
              return <OnboardingLoadingState type="preparation" message="Preparando onboarding personalizado..." />;
            }

            // Verificação de dados mínimos
            const hasMinimalData = data.memberType && (data.email || data.name);
            if (!hasMinimalData) {
              return <OnboardingLoadingState type="initialization" message="Carregando suas informações..." />;
            }

            // Erro de finalização com tratamento específico
            if (completionError) {
              return (
                <OnboardingErrorHandler
                  error={completionError}
                  type="system"
                  onRetry={() => handleSubmit()}
                  onCancel={() => window.location.href = '/dashboard'}
                  showContactSupport={true}
                />
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
