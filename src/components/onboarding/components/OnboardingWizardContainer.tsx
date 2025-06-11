
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { useCloudSync } from '../hooks/useCloudSync';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingWizardContainerProps {
  children: (props: {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isSubmitting: boolean;
    data: OnboardingData;
    updateData: (newData: Partial<OnboardingData>) => void;
    forceSave: () => Promise<void>;
    isLoading: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    validationErrors: Array<{ field: string; message: string }>;
    getFieldError: (field: string) => string | undefined;
    syncStatus: {
      isSyncing: boolean;
      lastSyncTime: string | null;
      syncError: string | null;
    };
    handleNext: () => Promise<void>;
    handlePrevious: () => void;
    handleDataChange: (newData: Partial<OnboardingData>) => void;
    handleSubmit: () => Promise<void>;
    isCurrentStepValid: boolean;
    totalSteps: number;
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
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

  const totalSteps = 6; // Corrigido para 6 etapas

  // Memoizar apenas valores estáticos
  const memberType = useMemo(() => data.memberType || 'club', [data.memberType]);
  
  // Validação estabilizada
  const isCurrentStepValid = useMemo(() => {
    try {
      const validationResult = validateCurrentStep(currentStep, data, memberType);
      return validationResult.isValid;
    } catch (error) {
      console.warn('Validation error:', error);
      return false;
    }
  }, [currentStep, data.name, data.email, data.phone, data.state, data.city, data.birthDate, data.curiosity, data.businessSector, data.position, data.hasImplementedAI, data.aiKnowledgeLevel, data.dailyTools, data.whoWillImplement, data.mainObjective, data.areaToImpact, data.expectedResult90Days, data.aiImplementationBudget, data.weeklyLearningTime, data.contentPreference, data.wantsNetworking, data.bestDays, data.bestPeriods, data.acceptsCaseStudy, memberType]);

  const handleNext = useCallback(async () => {
    if (currentStep < totalSteps && isCurrentStepValid) {
      try {
        await forceSave();
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Error saving on next:', error);
      }
    }
  }, [currentStep, totalSteps, isCurrentStepValid, forceSave]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    updateData(newData);
  }, [updateData]);

  const handleSubmit = useCallback(async () => {
    if (isCurrentStepValid && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const finalData = {
          ...data,
          completedAt: new Date().toISOString()
        };
        
        updateData(finalData);
        await forceSave();
        await saveToCloud(finalData);
        
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
  }, [isCurrentStepValid, isSubmitting, data, isAdminPreviewMode, updateData, forceSave, saveToCloud]);

  // Memoizar o objeto de props com dependências estáveis
  const childrenProps = useMemo(() => ({
    currentStep,
    setCurrentStep,
    isSubmitting,
    data,
    updateData,
    forceSave,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    syncStatus,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps
  }), [
    currentStep,
    isSubmitting,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    syncStatus,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps,
    updateData,
    forceSave,
    getFieldError
  ]);

  return children(childrenProps);
};
