
import React from 'react';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingLoader } from './components/OnboardingLoader';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

const OnboardingWizard = () => {
  console.log('[ONBOARDING-WIZARD] Componente principal renderizado');

  const handleError = (error: any, context: string) => {
    logger.error(`[ONBOARDING-WIZARD] Erro em ${context}:`, error, {
      component: 'OnboardingWizard',
      context,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
    
    toast.error(`Erro no onboarding: ${error?.message || 'Erro desconhecido'}`);
  };

  return (
    <OnboardingLoader>
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
              validationErrors, 
              getFieldError, 
              data, 
              memberType, 
              isLoading,
              isSubmitting,
              completionError 
            }) => {
              console.log('[ONBOARDING-WIZARD] Renderizando wizard com dados:', {
                currentStep,
                totalSteps,
                memberType,
                isLoading,
                isSubmitting,
                hasData: !!data,
                dataKeys: data ? Object.keys(data) : [],
                hasErrors: validationErrors.length > 0,
                completionError: completionError?.message
              });

              // Log específico para diagnosticar erro do admin
              if (completionError) {
                handleError(completionError, 'completion');
              }

              if (isLoading) {
                console.log('[ONBOARDING-WIZARD] Exibindo loading...');
                return (
                  <div className="bg-[#1A1E2E] rounded-xl p-8 shadow-2xl border border-gray-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00EAD9] mx-auto mb-4"></div>
                      <p className="text-white">Carregando onboarding...</p>
                    </div>
                  </div>
                );
              }

              const handleNextWithLogging = async () => {
                try {
                  console.log('[ONBOARDING-WIZARD] Avançando para próxima etapa...');
                  await handleNext();
                  console.log('[ONBOARDING-WIZARD] Etapa avançada com sucesso');
                } catch (error) {
                  handleError(error, 'next_step');
                }
              };

              const handlePrevWithLogging = () => {
                try {
                  console.log('[ONBOARDING-WIZARD] Voltando etapa...');
                  handlePrevious();
                  console.log('[ONBOARDING-WIZARD] Etapa anterior com sucesso');
                } catch (error) {
                  handleError(error, 'previous_step');
                }
              };

              const handleCompleteWithLogging = async () => {
                try {
                  console.log('[ONBOARDING-WIZARD] Finalizando onboarding...');
                  await handleSubmit();
                  console.log('[ONBOARDING-WIZARD] Onboarding finalizado com sucesso');
                } catch (error) {
                  handleError(error, 'completion');
                }
              };

              const handleDataChangeWithLogging = (newData: any) => {
                try {
                  console.log('[ONBOARDING-WIZARD] Atualizando dados:', Object.keys(newData));
                  handleDataChange(newData);
                } catch (error) {
                  handleError(error, 'data_change');
                }
              };

              return (
                <div className="bg-[#1A1E2E] rounded-xl p-8 shadow-2xl border border-gray-800">
                  {/* Header com progresso */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h1 className="text-2xl font-bold text-white">
                        Configuração Inicial
                      </h1>
                      <div className="text-sm text-gray-400">
                        Etapa {currentStep} de {totalSteps}
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#00EAD9] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Renderizar etapa atual */}
                  <OnboardingStepRenderer
                    currentStep={currentStep}
                    data={data}
                    onUpdateData={handleDataChangeWithLogging}
                    onNext={handleNextWithLogging}
                    onPrev={handlePrevWithLogging}
                    onComplete={handleCompleteWithLogging}
                    memberType={memberType}
                    validationErrors={validationErrors}
                    getFieldError={getFieldError}
                    isCompleting={isSubmitting}
                  />

                  {/* Debug info em desenvolvimento */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-400">
                        <div>Step: {currentStep}/{totalSteps}</div>
                        <div>Member Type: {memberType}</div>
                        <div>Data Keys: {data ? Object.keys(data).join(', ') : 'none'}</div>
                        <div>Errors: {validationErrors.length}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          </OnboardingWizardContainer>
        </div>
      </div>
    </OnboardingLoader>
  );
};

export default OnboardingWizard;
