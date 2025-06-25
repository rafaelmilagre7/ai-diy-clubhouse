
import React, { Suspense, useMemo, useEffect } from 'react';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingFieldsDiagnostic } from './components/OnboardingFieldsDiagnostic';
import { OnboardingLoadingState } from './components/OnboardingLoadingStates';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/utils/logger';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useSearchParams } from 'react-router-dom';

const OnboardingWizard = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const { inviteDetails, isLoading: inviteLoading, error: inviteError } = useInviteFlow(inviteToken || undefined);

  // Log da inicialização do wizard
  useEffect(() => {
    const startTime = Date.now();
    logger.info('[ONBOARDING-WIZARD] 🎭 Wizard inicializado:', {
      hasInviteToken: !!inviteToken,
      inviteLoading,
      hasInviteDetails: !!inviteDetails,
      inviteError,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    return () => {
      const duration = Date.now() - startTime;
      logger.info('[ONBOARDING-WIZARD] 📊 Wizard desmontado:', {
        sessionDuration: `${duration}ms`
      });
    };
  }, [inviteToken, inviteLoading, inviteDetails, inviteError]);

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
            // Log crítico do estado atual
            logger.info('[ONBOARDING-WIZARD] 🎯 Estado atual do wizard:', {
              currentStep,
              isLoading,
              fieldsEnabled: !isLoading,
              hasInviteData: !!(data.email && data.inviteToken),
              memberType,
              isCurrentStepValid,
              hasErrors: validationErrors.length > 0,
              dataKeys: Object.keys(data).length
            });

            // Se convite tem erro, mostrar claramente
            if (inviteError && inviteToken) {
              logger.warn('[ONBOARDING-WIZARD] ⚠️ Erro no convite detectado:', inviteError);
              return (
                <Card className="bg-[#1A1E2E]/90 backdrop-blur-sm border-red-500/20">
                  <CardContent className="p-8 text-center">
                    <div className="text-red-400 mb-4">
                      <h2 className="text-xl font-bold mb-2">Problema com o Convite</h2>
                      <p className="text-red-300">{inviteError}</p>
                    </div>
                    <p className="text-neutral-400 mb-6">
                      Você pode continuar o onboarding preenchendo os dados manualmente.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/onboarding'}
                      className="bg-[#0ABAB5] text-white px-6 py-2 rounded-lg hover:bg-[#089a96] transition-colors"
                    >
                      Continuar Onboarding
                    </button>
                  </CardContent>
                </Card>
              );
            }

            // Loading apenas se realmente necessário
            if (isLoading) {
              logger.info('[ONBOARDING-WIZARD] ⏳ Mostrando loading state');
              return (
                <OnboardingLoadingState 
                  type="initialization" 
                  message={inviteToken ? "Validando seu convite..." : "Carregando onboarding..."}
                />
              );
            }

            // Dados prontos - mostrar formulário
            const stepProps = useMemo(() => ({
              data,
              onUpdateData: handleDataChange,
              memberType,
              validationErrors,
              getFieldError,
              disabled: false,
              readOnly: false,
              isLoading: false
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
