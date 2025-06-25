
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OnboardingWizardContainer } from './components/OnboardingWizardContainer';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingWizardControls } from './components/OnboardingWizardControls';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingLoadingState } from './components/OnboardingLoadingStates';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { logger } from '@/utils/logger';

const OnboardingWizard = () => {
  const [searchParams] = useSearchParams();
  const { user, profile } = useSimpleAuth();
  
  const inviteToken = searchParams.get('token');
  
  useEffect(() => {
    logger.info('[ONBOARDING-WIZARD] Inicializando wizard', {
      hasToken: !!inviteToken,
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
            
            logger.info('[ONBOARDING-WIZARD] Renderizando wizard', {
              currentStep,
              totalSteps,
              isLoading,
              component: 'OnboardingWizard'
            });

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
