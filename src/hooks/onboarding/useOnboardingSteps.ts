
import { useEffect, useState } from 'react';
import { useProgress } from './useProgress';
import { toast } from 'sonner';
import { supabase } from "@/lib/supabase";
import { OnboardingData } from '@/types/onboarding';

export const useOnboardingSteps = () => {
  const { progress, updateProgress } = useProgress();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'personal', title: 'Informações Pessoais', section: 'personal_info' },
    { id: 'goals', title: 'Dados Profissionais', section: 'professional_info' },
    { id: 'ai_exp', title: 'Experiência com IA', section: 'ai_experience' },
    { id: 'industry', title: 'Foco da Indústria', section: 'industry_focus' },
    { id: 'resources', title: 'Recursos Necessários', section: 'resources_needs' },
    { id: 'team', title: 'Informações da Equipe', section: 'team_info' },
    { id: 'preferences', title: 'Preferências', section: 'implementation_preferences' }
  ];

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (progress?.completed_steps) {
      const lastCompletedIndex = Math.max(
        ...progress.completed_steps.map(step => 
          steps.findIndex(s => s.id === step)
        )
      );
      setCurrentStepIndex(Math.min(lastCompletedIndex + 1, steps.length - 1));
    }
  }, [progress?.completed_steps]);
  
  const saveStepData = async (
    stepId: string, 
    data: Partial<OnboardingData>
  ) => {
    if (!progress?.id) return;
    setIsSubmitting(true);
    try {
      // Ajuste: para dados profissionais, salvar tanto como professional_info quanto nos campos simples
      if (stepId === "goals") {
        await updateProgress({
          ...data,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else {
        const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
        if (!sectionKey) throw new Error('Seção inválida');
        await updateProgress({
          [sectionKey]: data[sectionKey],
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      }
      toast.success('Progresso salvo com sucesso!');
      setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async () => {
    if (!progress?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });

      toast.success('Onboarding concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao completar onboarding. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    steps,
    currentStep,
    currentStepIndex,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress
  };
};
