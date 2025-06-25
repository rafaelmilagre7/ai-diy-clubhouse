
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useOnboardingCompletion } from './useOnboardingCompletion';
import { useOnboardingValidation } from './useOnboardingValidation';
import { logger } from '@/utils/logger';

interface UseOnboardingWizardProps {
  initialData: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  memberType: 'club' | 'formacao';
}

export const useOnboardingWizard = ({ 
  initialData, 
  onDataChange, 
  memberType 
}: UseOnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isMountedRef = useRef(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onDataChangeRef = useRef(onDataChange);

  // Atualizar ref sem causar re-render
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  const { completeOnboarding, isCompleting, completionError } = useOnboardingCompletion();
  const { validateStep, validationErrors, getFieldError } = useOnboardingValidation();

  const totalSteps = 6;

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Verificar se dados estão minimamente prontos
  const isDataReady = useMemo(() => {
    const hasBasicData = !!(initialData.memberType && (initialData.email || initialData.name));
    logger.info('[ONBOARDING-WIZARD] Verificando dados:', {
      hasBasicData,
      memberType: initialData.memberType,
      hasEmail: !!initialData.email,
      hasName: !!initialData.name
    });
    return hasBasicData;
  }, [initialData.memberType, initialData.email, initialData.name]);

  // Handler de mudança de dados (estável)
  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    try {
      if (!isMountedRef.current) {
        logger.warn('[ONBOARDING-WIZARD] Componente desmontado - ignorando mudança');
        return;
      }
      
      logger.info('[ONBOARDING-WIZARD] 📝 Dados alterados:', {
        fields: Object.keys(newData)
      });
      
      onDataChangeRef.current(newData);
      setHasUnsavedChanges(true);
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          logger.info('[ONBOARDING-WIZARD] Auto-save executado');
        }
      }, 1000);
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro ao atualizar dados:', error);
    }
  }, []);

  const handleNext = useCallback(async (): Promise<void> => {
    try {
      if (currentStep < totalSteps) {
        // Para primeira etapa, ser mais permissivo
        if (currentStep === 1) {
          if (initialData.email || initialData.name) {
            logger.info('[ONBOARDING-WIZARD] ✅ Avançando etapa 1 (dados básicos OK)');
            setCurrentStep(prev => prev + 1);
          } else {
            logger.warn('[ONBOARDING-WIZARD] ⚠️ Etapa 1 - faltam dados básicos');
          }
        } else {
          // Para outras etapas, validar normalmente
          const isValid = validateStep(currentStep, initialData, memberType);
          if (isValid) {
            logger.info(`[ONBOARDING-WIZARD] ✅ Avançando para etapa: ${currentStep + 1}`);
            setCurrentStep(prev => prev + 1);
          } else {
            logger.warn(`[ONBOARDING-WIZARD] ⚠️ Validação falhou para etapa: ${currentStep}`);
          }
        }
      }
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro ao avançar etapa:', error);
    }
  }, [currentStep, totalSteps, validateStep, initialData, memberType]);

  const handlePrevious = useCallback(async (): Promise<void> => {
    try {
      if (currentStep > 1) {
        logger.info(`[ONBOARDING-WIZARD] ⬅️ Voltando para etapa: ${currentStep - 1}`);
        setCurrentStep(prev => prev - 1);
      }
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro ao voltar etapa:', error);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      logger.info('[ONBOARDING-WIZARD] 🎯 Iniciando finalização');
      await completeOnboarding(initialData, memberType);
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro na finalização:', error);
    }
  }, [completeOnboarding, initialData, memberType]);

  // Validação da etapa atual (mais permissiva)
  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 1) {
      return !!(initialData.email || initialData.name);
    }
    return validateStep(currentStep, initialData, memberType);
  }, [currentStep, initialData, memberType, validateStep]);

  return {
    currentStep,
    totalSteps,
    isSubmitting: isCompleting,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    lastSaved,
    hasUnsavedChanges,
    completionError
  };
};
