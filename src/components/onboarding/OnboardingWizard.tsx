
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingLoadingState } from './components/OnboardingLoadingStates';
import TokenDiagnosticReport from './components/TokenDiagnosticReport';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { tokenAudit } from '@/utils/tokenAuditLogger';
import { logger } from '@/utils/logger';

const OnboardingWizard = () => {
  const [searchParams] = useSearchParams();
  const { user, profile } = useSimpleAuth();
  
  const inviteToken = searchParams.get('token');
  
  useEffect(() => {
    logger.info('[ONBOARDING-WIZARD] Inicializando wizard com auditoria:', {
      hasToken: !!inviteToken,
      tokenLength: inviteToken?.length,
      userId: user?.id?.substring(0, 8) + '***' || 'none',
      hasProfile: !!profile,
      timestamp: new Date().toISOString()
    });
  }, [inviteToken, user?.id, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] text-white">
      <div className="container mx-auto px-4 py-8">
        <OnboardingWizardContainer>
          {(wizardProps) => {
            const { 
              currentStep, 
              totalSteps, 
              isLoading, 
              handleNext,
              handlePrevious, 
              handleSubmit,
              handleDataChange,
              data,
              memberType
            } = wizardProps;
            
            // Verificar se houve erro de token
            const auditReport = tokenAudit.generateAuditReport();
            const hasTokenError = auditReport.corruptionDetected || (inviteToken && auditReport.totalSteps === 0);
            
            logger.info('[ONBOARDING-WIZARD] Renderizando wizard:', {
              currentStep,
              totalSteps,
              isLoading,
              hasTokenError,
              auditSteps: auditReport.totalSteps,
              component: 'OnboardingWizard'
            });

            // Mostrar diagnóstico se houver erro de token
            if (hasTokenError && inviteToken) {
              return (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Erro no Convite</h1>
                    <p className="text-neutral-300">
                      Detectamos um problema com o token do seu convite. Veja os detalhes abaixo:
                    </p>
                  </div>
                  
                  <TokenDiagnosticReport 
                    onRetry={() => window.location.reload()} 
                  />
                </div>
              );
            }

            return (
              <>
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Progress Bar */}
                  <OnboardingProgress 
                    currentStep={currentStep} 
                    totalSteps={totalSteps} 
                  />
                  
                  {/* Loading States */}
                  {isLoading && <OnboardingLoadingState />}
                  
                  {/* Step Content */}
                  {!isLoading && (
                    <div className="bg-[#1A1E2E] rounded-lg p-8 border border-gray-800">
                      <OnboardingStepRenderer 
                        {...wizardProps}
                        onUpdateData={handleDataChange}
                      />
                    </div>
                  )}
                  
                  {/* Controls */}
                  {!isLoading && (
                    <OnboardingWizardControls 
                      {...wizardProps}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      onSubmit={handleSubmit}
                    />
                  )}
                </div>
              </>
            );
          }}
        </OnboardingWizardContainer>
      </div>
    </div>
  );
};

export default OnboardingWizard;
