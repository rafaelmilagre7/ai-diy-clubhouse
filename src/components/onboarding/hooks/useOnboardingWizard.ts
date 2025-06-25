
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

  // Verificar se dados estão prontos (memoizado para estabilidade)
  const isDataReady = useMemo(() => {
    const hasBasicData = !!(initialData.memberType && initialData.startedAt);
    const hasRequiredFields = !!(initialData.email || initialData.name);
    return hasBasicData && hasRequiredFields;
  }, [initialData.memberType, initialData.startedAt, initialData.email, initialData.name]);

  // Handler de mudança de dados com debounce (estável)
  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    try {
      if (!isMountedRef.current) {
        logger.warn('[ONBOARDING-WIZARD] Componente desmontado - ignorando mudança');
        return;
      }
      
      logger.info('[ONBOARDING-WIZARD] Dados alterados:', newData);
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
  }, []); // Sem dependências para garantir estabilidade

  const handleNext = useCallback(async (): Promise<void> => {
    try {
      if (currentStep < totalSteps) {
        if (isDataReady) {
          const isValid = validateStep(currentStep, initialData, memberType);
          if (isValid) {
            logger.info(`[ONBOARDING-WIZARD] Avançando para próxima etapa: ${currentStep + 1}`);
            setCurrentStep(prev => prev + 1);
          } else {
            logger.warn(`[ONBOARDING-WIZARD] Validação falhou para etapa: ${currentStep}`);
          }
        } else {
          // Para convites, permitir avanço na primeira etapa
          if (initialData.fromInvite && currentStep === 1) {
            logger.info('[ONBOARDING-WIZARD] Avançando etapa 1 (convite)');
            setCurrentStep(prev => prev + 1);
          } else {
            logger.warn('[ONBOARDING-WIZARD] Dados não prontos para avanço');
          }
        }
      }
      return Promise.resolve();
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro ao avançar etapa:', error);
      return Promise.resolve();
    }
  }, [currentStep, totalSteps, validateStep, initialData, memberType, isDataReady]);

  const handlePrevious = useCallback(async (): Promise<void> => {
    try {
      if (currentStep > 1) {
        logger.info(`[ONBOARDING-WIZARD] Voltando para etapa anterior: ${currentStep - 1}`);
        setCurrentStep(prev => prev - 1);
      }
      return Promise.resolve();
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro ao voltar etapa:', error);
      return Promise.resolve();
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      logger.info('[ONBOARDING-WIZARD] Iniciando finalização');
      await completeOnboarding(initialData, memberType);
      return Promise.resolve();
    } catch (error) {
      logger.error('[ONBOARDING-WIZARD] Erro na finalização:', error);
      return Promise.resolve();
    }
  }, [completeOnboarding, initialData, memberType]);

  // Validação da etapa atual (memoizada)
  const isCurrentStepValid = useMemo(() => {
    if (!isDataReady) return false;
    return validateStep(currentStep, initialData, memberType);
  }, [currentStep, initialData, memberType, validateStep, isDataReady]);

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
