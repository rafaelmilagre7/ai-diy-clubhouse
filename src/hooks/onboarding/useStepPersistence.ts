
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
      console.log(`Salvando dados da etapa: ${stepId}`, data);
      
      // Verificações específicas para cada etapa
      if (stepId === "personal") {
        const personalInfo = data.personal_info || {};
        if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
          console.error("Campos obrigatórios não preenchidos");
          return;
        }
        await updateProgress({
          personal_info: personalInfo,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Após salvar, navega para a próxima etapa com atraso para garantir fluidez
        setTimeout(() => {
          navigate("/onboarding/professional-data");
        }, 300);
      } else if (stepId === "professional_data") {
        const professionalInfo = data.professional_info || {};
        if (!professionalInfo.company_name || !professionalInfo.current_position || 
            !professionalInfo.company_sector || !professionalInfo.company_size) {
          console.error("Campos obrigatórios não preenchidos");
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
        
        // Após salvar, navega para a próxima etapa
        setTimeout(() => {
          navigate("/onboarding/business-context");
        }, 300);
      } else if (stepId === "business_context") {
        const businessContext = data.business_context || {};
        if (!businessContext.business_model || !businessContext.business_challenges || 
            !businessContext.short_term_goals || !businessContext.medium_term_goals || 
            !businessContext.important_kpis) {
          console.error("Campos obrigatórios não preenchidos");
          return;
        }
        await updateProgress({
          business_context: businessContext,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Navega para a próxima etapa
        setTimeout(() => {
          navigate("/onboarding/ai-experience");
        }, 300);
      } else if (stepId === "ai_exp") {
        const aiExperience = data.ai_experience || {};
        if (!aiExperience.knowledge_level || !aiExperience.previous_tools?.length || 
            !aiExperience.implemented_solutions?.length || !aiExperience.desired_solutions?.length ||
            aiExperience.nps_score === undefined) {
          console.error("Campos obrigatórios não preenchidos");
          return;
        }
        await updateProgress({
          ai_experience: aiExperience,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Navega para a próxima etapa
        setTimeout(() => {
          navigate("/onboarding/club-goals");
        }, 300);
      } else if (stepId === "business_goals") {
        const businessGoals = data.business_goals || {};
        if (!businessGoals.primary_goal || !businessGoals.expected_outcomes?.length || 
            !businessGoals.timeline) {
          console.error("Campos obrigatórios não preenchidos");
          return;
        }
        await updateProgress({
          business_goals: businessGoals,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Navega para a próxima etapa
        setTimeout(() => {
          navigate("/onboarding/customization");
        }, 300);
      } else if (stepId === "experience_personalization") {
        const e = data.experience_personalization || {};
        console.log("Validando dados de personalização:", e);
        
        if (!e.interests?.length ||
            !e.time_preference?.length ||
            !e.available_days?.length ||
            typeof e.networking_availability !== "number" ||
            !e.skills_to_share?.length ||
            !e.mentorship_topics?.length
        ) {
          console.error("Campos obrigatórios não preenchidos:", e);
          return;
        }
        
        await updateProgress({
          experience_personalization: e,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Navega para a próxima etapa
        setTimeout(() => {
          navigate("/onboarding/complementary");
        }, 300);
      } else if (stepId === "complementary_info") {
        const info = data.complementary_info || {};
        if (!info.how_found_us || !info.priority_topics?.length) {
          console.error("Campos obrigatórios não preenchidos");
          return;
        }
        await updateProgress({
          complementary_info: info,
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Navega para a página de revisão
        setTimeout(() => {
          navigate("/onboarding/review");
        }, 300);
      } else if (stepId === "review") {
        // Na etapa de revisão, apenas marcamos como completada
        await updateProgress({
          completed_steps: [...(progress.completed_steps || []), stepId],
          current_step: steps[Math.min(currentStepIndex + 1, steps.length - 1)].id,
        });
        
        // Redireciona para o dashboard após a revisão
        setTimeout(() => {
          navigate("/dashboard");
        }, 300);
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
      
      // Navega para a próxima etapa com atraso para garantir fluidez
      // Esta navegação genérica só é usada para as etapas que não têm tratamento específico acima
      if (stepId !== "personal" && stepId !== "professional_data" && 
          stepId !== "business_context" && stepId !== "ai_exp" && 
          stepId !== "business_goals" && stepId !== "experience_personalization" && 
          stepId !== "complementary_info" && stepId !== "review") {
        const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
        setCurrentStepIndex(nextStepIndex);
        const nextStep = steps[nextStepIndex];
        if (nextStep && nextStep.path) {
          setTimeout(() => {
            navigate(nextStep.path);
          }, 300);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
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
      
      // Redirecionamento para o dashboard após finalização
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
    }
  };

  return {
    saveStepData,
    completeOnboarding
  };
};
