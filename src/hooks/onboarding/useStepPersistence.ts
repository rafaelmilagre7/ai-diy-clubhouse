
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
    if (!progress?.id) {
      console.error("Não foi possível salvar dados: ID de progresso não encontrado");
      return;
    }
    
    try {
      console.log(`Salvando dados da etapa: ${stepId}`, data);
      
      // Construir objeto de atualização para essa etapa específica
      const updateObj: any = {};
      
      // Adicionar dados específicos da etapa
      if (stepId === "personal") {
        updateObj.personal_info = data.personal_info || {};
      } else if (stepId === "professional_data") {
        updateObj.professional_info = data.professional_info || {};
        // Também salvar campos individuais para compatibilidade
        if (data.professional_info) {
          updateObj.company_name = data.professional_info.company_name;
          updateObj.company_size = data.professional_info.company_size;
          updateObj.company_sector = data.professional_info.company_sector;
          updateObj.company_website = data.professional_info.company_website;
          updateObj.current_position = data.professional_info.current_position;
          updateObj.annual_revenue = data.professional_info.annual_revenue;
        }
      } else if (stepId === "business_context") {
        updateObj.business_context = data.business_context || {};
      } else if (stepId === "ai_exp") {
        updateObj.ai_experience = data.ai_experience || {};
      } else if (stepId === "business_goals") {
        updateObj.business_goals = data.business_goals || {};
      } else if (stepId === "experience_personalization") {
        updateObj.experience_personalization = data.experience_personalization || {};
      } else if (stepId === "complementary_info") {
        updateObj.complementary_info = data.complementary_info || {};
      } else {
        // Para outras etapas, use a seção correspondente
        const sectionKey = steps.find(s => s.id === stepId)?.section as keyof OnboardingData;
        if (sectionKey && data[sectionKey]) {
          updateObj[sectionKey] = data[sectionKey];
        }
      }
      
      // Atualizar informações de progresso
      if (!progress.completed_steps?.includes(stepId)) {
        updateObj.completed_steps = [...(progress.completed_steps || []), stepId];
      }
      
      // Definir próxima etapa
      const nextStep = steps[Math.min(currentStepIndex + 1, steps.length - 1)].id;
      updateObj.current_step = nextStep;
      
      // Salvar tudo no banco de dados
      console.log("Enviando atualização para o banco:", updateObj);
      await updateProgress(updateObj);
      
      // Forçar atualização dos dados
      await refreshProgress();
      
      // Determinar próxima rota com base no stepId
      if (stepId === "personal") {
        setTimeout(() => navigate("/onboarding/professional-data"), 500);
      } else if (stepId === "professional_data") {
        setTimeout(() => navigate("/onboarding/business-context"), 500);
      } else if (stepId === "business_context") {
        setTimeout(() => navigate("/onboarding/ai-experience"), 500);
      } else if (stepId === "ai_exp") {
        setTimeout(() => navigate("/onboarding/club-goals"), 500);
      } else if (stepId === "business_goals") {
        setTimeout(() => navigate("/onboarding/customization"), 500);
      } else if (stepId === "experience_personalization") {
        setTimeout(() => navigate("/onboarding/complementary"), 500);
      } else if (stepId === "complementary_info") {
        setTimeout(() => navigate("/onboarding/review"), 500);
      } else if (stepId === "review") {
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        // Navegação genérica
        const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
        const nextStepObj = steps[nextStepIndex];
        if (nextStepObj && nextStepObj.path) {
          setTimeout(() => navigate(nextStepObj.path), 500);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      // Não exibir toast, conforme solicitado
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
      }, 500);
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
    }
  };

  return {
    saveStepData,
    completeOnboarding
  };
};
