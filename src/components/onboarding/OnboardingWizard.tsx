
import React, { Suspense, useMemo } from 'react';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingFieldsDiagnostic } from './components/OnboardingFieldsDiagnostic';
import { OnboardingLoadingState } from './components/OnboardingLoadingStates';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/utils/logger';

const OnboardingWizard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <OnboardingWizardContainer>
          {({ 
            currentStep, 
            totalSteps, 
            handleNext, 
            handlePrevious, 
            handleDataChange, 
            handleSubmit, 
            isCurrentStepValid, 
            isSubmitting,
            validationErrors,
            getFieldError,
            data, 
            memberType, 
            isLoading,
            lastSaved,
            hasUnsavedChanges,
            completionError
          }) => {
            // Log crítico para diagnóstico
            logger.info('[ONBOARDING-WIZARD] Renderizando wizard:', {
              currentStep,
              isLoading,
              fieldsEnabled: !isLoading,
              hasData: !!data.email,
              memberType,
              dataKeys: Object.keys(data)
            });

            // Se ainda está carregando dados essenciais, mostrar loading
            if (isLoading) {
              return (
                <OnboardingLoadingState 
                  type="initialization" 
                  message="Carregando seus dados..."
                />
              );
            }

            // Dados prontos para edição
            const stepProps = useMemo(() => ({
              data,
              onUpdateData: handleDataChange,
              memberType,
              validationErrors,
              getFieldError,
              // CRÍTICO: Garantir que campos estejam sempre habilitados
              disabled: false,
              readOnly: false,
              isLoading: false // Forçar campos habilitados
            }), [data, handleDataChange, memberType, validationErrors, getFieldError]);

            return (
              <Card className="bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  {/* Diagnóstico em modo desenvolvimento */}
                  <OnboardingFieldsDiagnostic
                    isLoading={isLoading}
                    data={data}
                    memberType={memberType}
                    inviteToken={data.inviteToken}
                  />

                  {/* Progresso */}
                  <div className="mb-8">
                    <OnboardingProgress 
                      currentStep={currentStep} 
                      totalSteps={totalSteps} 
                      memberType={memberType}
                    />
                  </div>

                  {/* Conteúdo do Step */}
                  <div className="mb-8">
                    <Suspense fallback={
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
                      </div>
                    }>
                      <OnboardingStepRenderer
                        currentStep={currentStep}
                        {...stepProps}
                      />
                    </Suspense>
                  </div>

                  {/* Controles de Navegação */}
                  <OnboardingWizardControls
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    canProceed={isCurrentStepValid}
                    isSubmitting={isSubmitting}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSubmit={handleSubmit}
                    memberType={memberType}
                    lastSaved={lastSaved}
                    hasUnsavedChanges={hasUnsavedChanges}
                    completionError={completionError}
                  />
                </CardContent>
              </Card>
            );
          }}
        </OnboardingWizardContainer>
      </div>
    </div>
  );
};

export default OnboardingWizard;
