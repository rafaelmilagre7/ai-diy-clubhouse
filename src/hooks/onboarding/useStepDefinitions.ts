
import { CompleteOnboardingStep } from '@/types/onboarding';

// Lista completa de etapas para ambos os tipos de onboarding
export const completeSteps: CompleteOnboardingStep[] = [
  // Etapas comuns para ambos
  {
    id: "personal",
    title: "Informações Pessoais",
    section: "personal_info",
    path: "/onboarding/personal-info",
    forClub: true,
    forFormation: true
  },
  // Etapas específicas para Club
  {
    id: "professional_data",
    title: "Dados Profissionais",
    section: "professional_info",
    path: "/onboarding/professional-data",
    forClub: true,
    forFormation: false
  },
  {
    id: "business_context",
    title: "Contexto do Negócio",
    section: "business_context",
    path: "/onboarding/business-context",
    forClub: true,
    forFormation: false
  },
  {
    id: "ai_exp",
    title: "Experiência com IA",
    section: "ai_experience",
    path: "/onboarding/ai-experience",
    forClub: true,
    forFormation: true
  },
  {
    id: "business_goals",
    title: "Objetivos de Negócio",
    section: "business_goals",
    path: "/onboarding/club-goals",
    forClub: true,
    forFormation: false
  },
  {
    id: "experience_personalization",
    title: "Personalização da Experiência",
    section: "experience_personalization",
    path: "/onboarding/customization",
    forClub: true,
    forFormation: false
  },
  {
    id: "complementary_info",
    title: "Informações Complementares",
    section: "complementary_info",
    path: "/onboarding/complementary",
    forClub: true,
    forFormation: false
  },
  // Etapas específicas para Formação
  {
    id: "formation_goals",
    title: "Objetivos de Aprendizado",
    section: "formation_data",
    path: "/onboarding/formacao/goals",
    forClub: false,
    forFormation: true
  },
  {
    id: "learning_preferences",
    title: "Preferências de Aprendizado",
    section: "formation_data",
    path: "/onboarding/formacao/preferences",
    forClub: false,
    forFormation: true
  },
  // Revisão para ambos
  {
    id: "review",
    title: "Revisão",
    section: "review",
    path: "/onboarding/review",
    forClub: true,
    forFormation: true
  }
];

// Função para filtrar etapas por tipo de usuário
export const getStepsByUserType = (userType: 'club' | 'formacao') => {
  if (userType === 'club') {
    return completeSteps.filter(step => step.forClub !== false);
  } else {
    return completeSteps.filter(step => step.forFormation === true);
  }
};

// Exportando as etapas do Club por compatibilidade com código existente
export const steps = getStepsByUserType('club');

// Usando um hook para retornar as etapas baseado no tipo de usuário
export const useStepDefinitions = (userType: 'club' | 'formacao' = 'club') => {
  return {
    steps: getStepsByUserType(userType),
    allSteps: completeSteps
  };
};

export default useStepDefinitions;
