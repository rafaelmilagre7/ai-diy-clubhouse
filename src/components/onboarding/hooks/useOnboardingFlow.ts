
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useOnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = useCallback(async (
    isValid: boolean, 
    forceSave: () => Promise<void>,
    setLastSaved: (date: Date) => void,
    setHasUnsavedChanges: (value: boolean) => void
  ) => {
    if (!isValid) {
      toast.error('Por favor, complete todos os campos obrigatórios antes de continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await forceSave();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar seus dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  return {
    currentStep,
    isSubmitting,
    setIsSubmitting,
    handleNext,
    handlePrevious
  };
};
