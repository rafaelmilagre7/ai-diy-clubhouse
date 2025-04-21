
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';
import { useProgress } from './useProgress';
import { steps } from './useStepDefinitions';

export const useStepPersistence = ({
  currentStepIndex,
  setCurrentStepIndex,
  navigate
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
}) => {
  const { progress, updateProgress, refreshProgress } = useProgress();

  const saveStepData = async (
    stepId: string, 
    data: Partial<OnboardingData>
  ) => {
    if (!progress?.id) return;
    try {
      // Verificações específicas para cada etapa
      
      // Etapa específica para dados profissionais
      if (stepId === "goals") {
        const professionalInfo = data.professional_info || {};
        if (!professionalInfo.company_name || !professionalInfo.company_size || 
            !professionalInfo.company_sector || !professionalInfo.current_position ||
            !professionalInfo.annual_revenue) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }
        await updateProgress({
          professional_info: professionalInfo,
          company_name: professionalInfo.company_name,
          company_size: professionalInfo.company_size,
          company_sector: professionalInfo.company_sector,
          company_website: professionalInfo.company_website,
          current_position: professionalInfo.current_position,
          annual_revenue: professionalInfo.annual_revenue,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else if (stepId === "business_context") {
        const businessContext = data.business_context || {};
        if (!businessContext.business_model || !businessContext.business_challenges || 
            !businessContext.short_term_goals || !businessContext.medium_term_goals || 
            !businessContext.important_kpis) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }
        await updateProgress({
          business_context: businessContext,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else if (stepId === "ai_exp") {
        const aiExperience = data.ai_experience || {};
        if (!aiExperience.knowledge_level || !aiExperience.previous_tools?.length || 
            !aiExperience.implemented_solutions?.length || !aiExperience.desired_solutions?.length ||
            aiExperience.nps_score === undefined) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }
        await updateProgress({
          ai_experience: aiExperience,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else if (stepId === "business_goals") {
        const businessGoals = data.business_goals || {};
        if (!businessGoals.primary_goal || !businessGoals.expected_outcomes?.length || 
            !businessGoals.timeline) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }
        await updateProgress({
          business_goals: businessGoals,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else if (stepId === "experience_personalization") {
        const e = data.experience_personalization || {};
        if (!e.interests?.length ||
            !e.time_preference ||
            !e.available_days?.length ||
            typeof e.networking_availability !== "number" ||
            !e.skills_to_share?.length ||
            !e.mentorship_topics?.length
        ) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }
        await updateProgress({
          experience_personalization: e,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      } else {
        // Salvamento genérico para outras etapas
        const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
        if (!sectionKey) throw new Error('Seção inválida');
        
        await updateProgress({
          [sectionKey]: data[sectionKey],
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
      }
      
      // Atualiza o progresso após salvar
      await refreshProgress();
      toast.success("Progresso salvo com sucesso!");
      
      // Navega para a próxima etapa com atraso para garantir fluidez
      const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
      setCurrentStepIndex(nextStepIndex);
      const nextStep = steps[nextStepIndex];
      if (nextStep && nextStep.path) {
        setTimeout(() => {
          navigate(nextStep.path);
        }, 300);
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    }
  };

  const completeOnboarding = async () => {
    if (!progress?.id) return;
    try {
      await updateProgress({
        is_completed: true,
        completed_steps: steps.map(s => s.id),
      });
      await refreshProgress();
      toast.success("Onboarding concluído com sucesso!");
    } catch (error) {
      toast.error('Erro ao completar onboarding. Tente novamente.');
    }
  };

  return {
    saveStepData,
    completeOnboarding
  };
};
