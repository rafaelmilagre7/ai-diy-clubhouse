
import { OnboardingProgress } from '@/types/onboarding';

export const useOnboardingValidation = () => {
  const validateOnboardingCompletion = (progress: OnboardingProgress | null): boolean => {
    if (!progress) return false;
    
    // Verificar se todas as etapas obrigatórias foram completadas
    const requiredSteps = [
      'personal_info',
      'professional_info', 
      'business_context',
      'ai_experience',
      'business_goals',
      'experience_personalization',
      'complementary_info',
      'review'
    ];
    
    // Verificar se completed_steps contém todas as etapas obrigatórias
    const completedSteps = progress.completed_steps || [];
    const hasAllRequiredSteps = requiredSteps.every(step => 
      completedSteps.includes(step)
    );
    
    // Verificar se dados essenciais estão preenchidos
    const hasPersonalInfo = progress.personal_info?.name && progress.personal_info?.email;
    const hasProfessionalInfo = progress.professional_info?.company_name;
    const hasBusinessGoals = progress.business_goals?.primary_goal;
    const hasAIExperience = progress.ai_experience?.knowledge_level;
    
    // Onboarding só está completo se TODAS as condições forem atendidas
    return (
      hasAllRequiredSteps &&
      hasPersonalInfo &&
      hasProfessionalInfo &&
      hasBusinessGoals &&
      hasAIExperience &&
      progress.is_completed === true
    );
  };
  
  const getIncompleteSteps = (progress: OnboardingProgress | null): string[] => {
    if (!progress) return ['personal_info'];
    
    const requiredSteps = [
      'personal_info',
      'professional_info',
      'business_context', 
      'ai_experience',
      'business_goals',
      'experience_personalization',
      'complementary_info',
      'review'
    ];
    
    const completedSteps = progress.completed_steps || [];
    return requiredSteps.filter(step => !completedSteps.includes(step));
  };
  
  return {
    validateOnboardingCompletion,
    getIncompleteSteps
  };
};
