
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
    
    // Verificar se dados essenciais estão preenchidos (mesma lógica do banco)
    const hasPersonalInfo = progress.personal_info && 
                           typeof progress.personal_info === 'object' &&
                           progress.personal_info.name && 
                           progress.personal_info.email;
                           
    const hasProfessionalInfo = progress.professional_info && 
                               typeof progress.professional_info === 'object' &&
                               progress.professional_info.company_name;
                               
    const hasBusinessGoals = progress.business_goals && 
                            typeof progress.business_goals === 'object' &&
                            progress.business_goals.primary_goal;
                            
    const hasAIExperience = progress.ai_experience && 
                           typeof progress.ai_experience === 'object' &&
                           progress.ai_experience.knowledge_level;
    
    // Onboarding só está completo se TODAS as condições forem atendidas
    // Incluindo a verificação do banco via is_completed (que agora tem validação robusta)
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

  // Nova função para detectar dados incompletos mesmo que marked as complete
  const detectIncompleteData = (progress: OnboardingProgress | null): string[] => {
    if (!progress) return [];
    
    const issues: string[] = [];
    
    // Verificar dados essenciais
    if (!progress.personal_info || !progress.personal_info.name || !progress.personal_info.email) {
      issues.push('Informações pessoais incompletas');
    }
    
    if (!progress.professional_info || !progress.professional_info.company_name) {
      issues.push('Informações profissionais incompletas');
    }
    
    if (!progress.business_goals || !progress.business_goals.primary_goal) {
      issues.push('Objetivos de negócio não definidos');
    }
    
    if (!progress.ai_experience || !progress.ai_experience.knowledge_level) {
      issues.push('Experiência com IA não informada');
    }
    
    return issues;
  };
  
  return {
    validateOnboardingCompletion,
    getIncompleteSteps,
    detectIncompleteData
  };
};
