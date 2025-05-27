
import { OnboardingProgress } from "@/types/onboarding";

export const useOnboardingValidation = () => {
  const validateOnboardingCompletion = (progress: OnboardingProgress): boolean => {
    if (!progress) return false;

    // Validação simplificada para o onboarding NOVO
    const hasPersonalInfo = !!(
      progress.personal_info?.name &&
      progress.personal_info?.email
    );

    const hasAIExperience = !!(
      progress.ai_experience?.knowledge_level
    );

    // Considerar completo se tiver as informações básicas
    // A trilha será gerada na última etapa
    return hasPersonalInfo && hasAIExperience && progress.is_completed;
  };

  const getCompletionProgress = (progress: OnboardingProgress): {
    completed: number;
    total: number;
    percentage: number;
  } => {
    if (!progress) return { completed: 0, total: 3, percentage: 0 };

    let completed = 0;
    const total = 3;

    if (progress.personal_info?.name && progress.personal_info?.email) {
      completed++;
    }

    if (progress.ai_experience?.knowledge_level) {
      completed++;
    }

    if (progress.is_completed) {
      completed++;
    }

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  };

  const getNextIncompleteStep = (progress: OnboardingProgress): string | null => {
    if (!progress) return "personal_info";

    if (!progress.personal_info?.name || !progress.personal_info?.email) {
      return "personal_info";
    }

    if (!progress.ai_experience?.knowledge_level) {
      return "ai_experience";
    }

    if (!progress.is_completed) {
      return "trail_generation";
    }

    return null;
  };

  return {
    validateOnboardingCompletion,
    getCompletionProgress,
    getNextIncompleteStep
  };
};
