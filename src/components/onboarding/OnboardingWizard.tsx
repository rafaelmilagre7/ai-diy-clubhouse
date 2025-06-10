
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStorage } from './hooks/useOnboardingStorage';
import { useOnboardingValidation } from './hooks/useOnboardingValidation';
import { useCloudSync } from './hooks/useCloudSync';
import { OnboardingProgress } from './OnboardingProgress';
import OnboardingStep1 from './steps/OnboardingStep1';
import OnboardingStep3 from './steps/OnboardingStep3';
import { OnboardingFinal } from './steps/OnboardingFinal';
import { OnboardingNavigation } from './OnboardingNavigation';
import { OnboardingSaveIndicator } from './components/OnboardingSaveIndicator';
import { OnboardingData } from './types/onboardingTypes';
import { Card } from '@/components/ui/card';
import { useAdminPreview } from '@/hooks/useAdminPreview';

interface Props {}

const initialData: OnboardingData = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  linkedin: '',
  state: '',
  city: '',
  birthDate: '',
  curiosity: '',
  companyName: '',
  companyWebsite: '',
  businessSector: '',
  companySize: '',
  annualRevenue: '',
  position: '',
  hasImplementedAI: '',
  aiToolsUsed: [],
  aiKnowledgeLevel: '',
  dailyTools: [],
  whoWillImplement: '',
  mainObjective: '',
  areaToImpact: '',
  expectedResult90Days: '',
  aiImplementationBudget: '',
  weeklyLearningTime: '',
  contentPreference: '',
  wantsNetworking: 'no',
  bestDays: [],
  bestPeriods: [],
  acceptsCaseStudy: 'no',
  memberType: 'club',
  completedAt: '',
  startedAt: ''
};

const stepTitles = [
  'Informações Pessoais',
  'Perfil de IA',
  'Finalização'
];

const OnboardingWizard = () => {
  const { user } = useAuth();
  const { isAdminPreviewMode } = useAdminPreview();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    data, 
    updateData, 
    forceSave,
    isLoading, 
    lastSaved,
    hasUnsavedChanges 
  } = useOnboardingStorage();
  
  const { 
    validateCurrentStep,
    validationErrors,
    getFieldError
  } = useOnboardingValidation();
  
  const { 
    saveToCloud,
    syncStatus
  } = useCloudSync();

  const totalSteps = 3;

  // Validar etapa atual
  const validationResult = validateCurrentStep(currentStep, data, data.memberType || 'club');
  const isCurrentStepValid = validationResult.isValid;

  const handleNext = async () => {
    if (currentStep < totalSteps && isCurrentStepValid) {
      // Salvar dados antes de avançar
      await forceSave();
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleDataChange = (newData: Partial<OnboardingData>) => {
    updateData(newData);
  };

  const handleSubmit = async () => {
    if (isCurrentStepValid && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Marcar como completado
        const finalData = {
          ...data,
          completedAt: new Date().toISOString()
        };
        
        updateData(finalData);
        await forceSave();
        await saveToCloud(finalData);
        
        // Redirecionar após conclusão
        setTimeout(() => {
          if (isAdminPreviewMode) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }, 2000);
      } catch (error) {
        console.error('Erro ao finalizar onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            data={data}
            onUpdateData={handleDataChange}
            onNext={handleNext}
            memberType={data.memberType || 'club'}
            validationErrors={validationErrors}
            getFieldError={getFieldError}
          />
        );
      case 2:
        return (
          <OnboardingStep3
            data={data}
            onUpdateData={handleDataChange}
            onNext={handleNext}
            onPrev={handlePrevious}
            memberType={data.memberType || 'club'}
            validationErrors={validationErrors}
            getFieldError={getFieldError}
          />
        );
      case 3:
        return (
          <OnboardingFinal
            data={data}
            onNext={handleSubmit}
            memberType={data.memberType || 'club'}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

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
            {renderStep()}
            
            <OnboardingNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrev={handlePrevious}
              canProceed={isCurrentStepValid}
              isLoading={isSubmitting}
            />
          </Card>
          
          <OnboardingSaveIndicator
            hasUnsavedChanges={hasUnsavedChanges}
            lastSaved={lastSaved}
            syncStatus={syncStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
