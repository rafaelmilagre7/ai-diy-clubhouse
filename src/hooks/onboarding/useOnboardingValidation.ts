
import { OnboardingProgress } from '@/types/onboarding';

export const useOnboardingValidation = () => {
  const validateOnboardingCompletion = (progress: OnboardingProgress | null): boolean => {
    if (!progress) {
      console.log("[Validation] Sem progresso, onboarding incompleto");
      return false;
    }
    
    console.log("[Validation] Validando completude do onboarding:", {
      progressId: progress.id,
      isCompleted: progress.is_completed,
      completedSteps: progress.completed_steps
    });
    
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
    
    console.log("[Validation] Verificação de etapas:", {
      requiredSteps,
      completedSteps,
      hasAllRequiredSteps
    });
    
    // Verificar dados essenciais com estrutura normalizada
    const personalInfo = progress.personal_info;
    const hasPersonalInfo = personalInfo && 
                           typeof personalInfo === 'object' &&
                           personalInfo.name && 
                           personalInfo.email;
                           
    console.log("[Validation] Personal info:", {
      exists: !!personalInfo,
      hasName: !!(personalInfo?.name),
      hasEmail: !!(personalInfo?.email),
      valid: hasPersonalInfo
    });
                           
    const professionalInfo = progress.professional_info;
    const hasProfessionalInfo = professionalInfo && 
                               typeof professionalInfo === 'object' &&
                               professionalInfo.company_name;
                               
    console.log("[Validation] Professional info:", {
      exists: !!professionalInfo,
      hasCompanyName: !!(professionalInfo?.company_name),
      valid: hasProfessionalInfo
    });
                               
    const businessGoals = progress.business_goals;
    const hasBusinessGoals = businessGoals && 
                            typeof businessGoals === 'object' &&
                            businessGoals.primary_goal;
                            
    console.log("[Validation] Business goals:", {
      exists: !!businessGoals,
      hasPrimaryGoal: !!(businessGoals?.primary_goal),
      valid: hasBusinessGoals
    });
    
    // Verificar AI Experience com estrutura possivelmente aninhada
    let aiExperience = progress.ai_experience;
    let hasAIExperience = false;
    
    if (aiExperience && typeof aiExperience === 'object') {
      // Verificar se está na estrutura aninhada (ai_experience.ai_experience)
      if (aiExperience.ai_experience && typeof aiExperience.ai_experience === 'object') {
        console.log("[Validation] AI Experience estrutura aninhada detectada");
        aiExperience = aiExperience.ai_experience;
      }
      
      hasAIExperience = !!(aiExperience.knowledge_level);
    }
    
    console.log("[Validation] AI Experience:", {
      exists: !!progress.ai_experience,
      structure: typeof progress.ai_experience,
      hasKnowledgeLevel: hasAIExperience,
      rawData: progress.ai_experience
    });
    
    // Verificar se is_completed está marcado como true no banco
    const isMarkedComplete = progress.is_completed === true;
    
    console.log("[Validation] Status final:", {
      hasAllRequiredSteps,
      hasPersonalInfo,
      hasProfessionalInfo,
      hasBusinessGoals,
      hasAIExperience,
      isMarkedComplete
    });
    
    // Onboarding só está completo se TODAS as condições forem atendidas
    const isComplete = (
      hasAllRequiredSteps &&
      hasPersonalInfo &&
      hasProfessionalInfo &&
      hasBusinessGoals &&
      hasAIExperience &&
      isMarkedComplete
    );
    
    console.log("[Validation] Resultado final:", {
      isComplete,
      reason: !isComplete ? {
        missingSteps: !hasAllRequiredSteps,
        missingPersonal: !hasPersonalInfo,
        missingProfessional: !hasProfessionalInfo,
        missingGoals: !hasBusinessGoals,
        missingAI: !hasAIExperience,
        notMarkedComplete: !isMarkedComplete
      } : 'Onboarding completo'
    });
    
    return isComplete;
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
    const incompleteSteps = requiredSteps.filter(step => !completedSteps.includes(step));
    
    console.log("[Validation] Etapas incompletas:", {
      requiredSteps,
      completedSteps,
      incompleteSteps
    });
    
    return incompleteSteps;
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
    
    // Verificar AI Experience considerando estrutura aninhada
    let aiExperience = progress.ai_experience;
    if (aiExperience && aiExperience.ai_experience) {
      aiExperience = aiExperience.ai_experience;
    }
    
    if (!aiExperience || !aiExperience.knowledge_level) {
      issues.push('Experiência com IA não informada');
    }
    
    console.log("[Validation] Problemas detectados:", issues);
    
    return issues;
  };

  // Nova função para normalizar dados de AI Experience
  const normalizeAIExperienceData = (aiExperience: any): any => {
    if (!aiExperience) return null;
    
    // Se já está na estrutura correta, retornar como está
    if (aiExperience.knowledge_level && !aiExperience.ai_experience) {
      return aiExperience;
    }
    
    // Se está na estrutura aninhada, extrair os dados
    if (aiExperience.ai_experience && typeof aiExperience.ai_experience === 'object') {
      console.log("[Validation] Normalizando estrutura aninhada de AI Experience");
      return {
        ...aiExperience.ai_experience,
        onboarding_type: aiExperience.onboarding_type || 'club'
      };
    }
    
    return aiExperience;
  };
  
  return {
    validateOnboardingCompletion,
    getIncompleteSteps,
    detectIncompleteData,
    normalizeAIExperienceData
  };
};
