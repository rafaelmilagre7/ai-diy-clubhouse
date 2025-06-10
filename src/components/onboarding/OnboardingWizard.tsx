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
  wantsNetworking: false,
  bestDays: [],
  bestPeriods: [],
  acceptsCaseStudy: false,
  memberType: 'club',
  completedAt: '',
  startedAt: ''
};

const validationRules = {
  1: {
    name: 'required',
    email: 'required|email',
    phone: 'required',
    state: 'required',
    city: 'required',
    birthDate: 'required',
    memberType: 'required'
  },
  2: {
    companyName: 'required',
    companyWebsite: 'required|url',
    businessSector: 'required',
    companySize: 'required',
    annualRevenue: 'required',
    position: 'required'
  },
  3: {
    hasImplementedAI: 'required',
    aiKnowledgeLevel: 'required',
    whoWillImplement: 'required',
    mainObjective: 'required',
    areaToImpact: 'required',
    expectedResult90Days: 'required',
    aiImplementationBudget: 'required',
    weeklyLearningTime: 'required',
    contentPreference: 'required'
  }
};

const OnboardingWizard = () => {
  const { user } = useAuth();
  const { isAdminPreviewMode } = useAdminPreview();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    data, 
    saveData, 
    isLoading, 
    lastSaved,
    hasUnsavedChanges 
  } = useOnboardingStorage();
  
  const { 
    isValid: isCurrentStepValid, 
    errors 
  } = useOnboardingValidation(data, currentStep);
  
  const { 
    syncToCloud, 
    isSyncing,
    lastSyncTime 
  } = useCloudSync();

  const totalSteps = 3;

  const handleNext = async () => {
    if (currentStep < totalSteps && isCurrentStepValid) {
      // Salvar dados antes de avançar
      await saveData(data);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleDataChange = (newData: Partial<OnboardingData>) => {
    saveData({ ...data, ...newData });
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
        
        await saveData(finalData);
        await syncToCloud(finalData);
        
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
            onDataChange={handleDataChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <OnboardingStep3
            data={data}
            onDataChange={handleDataChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <OnboardingFinal
            data={data}
            onSubmit={handleSubmit}
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
          />
          
          <Card className="mt-8 p-8">
            {renderStep()}
            
            <OnboardingNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isNextDisabled={!isCurrentStepValid}
              isSubmitting={isSubmitting}
            />
          </Card>
          
          <OnboardingSaveIndicator
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
