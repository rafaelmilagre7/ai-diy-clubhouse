import { useState, useCallback, useEffect } from 'react';
import { useOnboardingProgress } from './useOnboardingProgress';
import { useAuth } from '@/contexts/auth';
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

export function useUnifiedOnboardingFlow() {
  const { user } = useAuth();
  const { progress, updateProgress, isLoading } = useOnboardingProgress();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definir os steps do fluxo unificado
  const steps = [
    { id: 'personal_info', title: 'Informações Pessoais', section: 'personal_info' },
    { id: 'ai_experience', title: 'Experiência com IA', section: 'ai_experience' },
    { id: 'trail_generation', title: 'Geração de Trilha', section: 'trail_generation' }
  ];

  const currentStep = steps[currentStepIndex];

  // Inicializar step atual baseado no progresso
  useEffect(() => {
    if (progress && !isLoading) {
      const completedSteps = progress.completed_steps || [];
      const nextStepIndex = steps.findIndex(step => !completedSteps.includes(step.id));
      
      if (nextStepIndex !== -1) {
        setCurrentStepIndex(nextStepIndex);
      } else if (progress.is_completed) {
        setCurrentStepIndex(steps.length); // Onboarding completo
      }
    }
  }, [progress, isLoading]);

  const handleStepSubmit = useCallback(async (stepId: string, data: Partial<OnboardingData>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Preparar dados sem onboarding_type
      const updateData: Partial<OnboardingData> = {
        ...data
      };

      console.log('Submetendo step:', stepId, 'com dados:', updateData);
      
      // Atualizar progresso
      await updateProgress(updateData, stepId);
      
      // Avançar para próximo step
      const nextStepIndex = currentStepIndex + 1;
      
      if (nextStepIndex < steps.length) {
        setCurrentStepIndex(nextStepIndex);
        toast.success('Dados salvos com sucesso!');
      } else {
        // Onboarding completo
        toast.success('Onboarding concluído com sucesso!');
      }
      
    } catch (error) {
      console.error('Erro ao submeter step:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, currentStepIndex, updateProgress]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex]);

  return {
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isSubmitting,
    isLoading,
    progress,
    handleStepSubmit,
    handlePrevious,
    handleNext,
    isLastStep: currentStepIndex === steps.length - 1,
    isCompleted: progress?.is_completed || false,
    // Remover referência a onboarding_type
    initialData: {
      personal_info: progress?.personal_info || {},
      ai_experience: progress?.ai_experience || {},
      // ... outras seções conforme necessário
    }
  };
}
