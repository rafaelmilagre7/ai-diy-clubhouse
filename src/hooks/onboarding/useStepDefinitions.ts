
import { CompleteOnboardingStep } from "@/types/onboarding";

// Definição das etapas do onboarding
export const steps: CompleteOnboardingStep[] = [
  {
    id: "personal_info",
    title: "Informações Pessoais",
    section: "personal_info",
    path: "/onboarding/personal-info",
    forClub: true,
    forFormation: true
  },
  {
    id: "professional_info", 
    title: "Dados Profissionais",
    section: "professional_info",
    path: "/onboarding/professional-data",
    forClub: true
  },
  {
    id: "business_context",
    title: "Contexto de Negócio",
    section: "business_context",
    path: "/onboarding/business-context",
    forClub: true
  },
  {
    id: "ai_experience",
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
    forClub: true
  },
  {
    id: "experience_personalization",
    title: "Personalização da Experiência",
    section: "experience_personalization",
    path: "/onboarding/customization",
    forClub: true
  },
  {
    id: "complementary_info",
    title: "Informações Complementares",
    section: "complementary_info",
    path: "/onboarding/complementary",
    forClub: true
  },
  {
    id: "review",
    title: "Revisão",
    section: "review",
    path: "/onboarding/review",
    forClub: true,
    forFormation: true
  },
  {
    id: "trail_generation",
    title: "Geração de Trilha",
    section: "trail_generation",
    path: "/onboarding/trail-generation",
    forClub: true
  }
];

// Etapas específicas para a formação
export const formationSteps: CompleteOnboardingStep[] = [
  {
    id: "personal_info", 
    title: "Informações Pessoais",
    section: "personal_info",
    path: "/onboarding/formacao/personal-info",
    forFormation: true
  },
  {
    id: "ai_experience",
    title: "Experiência com IA",
    section: "ai_experience",
    path: "/onboarding/formacao/ai-experience",
    forFormation: true
  },
  {
    id: "learning_goals",
    title: "Objetivos de Aprendizado",
    section: "formation_data",
    path: "/onboarding/formacao/goals",
    forFormation: true
  },
  {
    id: "learning_preferences",
    title: "Preferências de Aprendizado",
    section: "formation_data",
    path: "/onboarding/formacao/preferences",
    forFormation: true
  },
  {
    id: "review",
    title: "Revisão",
    section: "review",
    path: "/onboarding/formacao/review",
    forFormation: true
  }
];

// Função para obter os passos com base no tipo de onboarding
export function getStepsByUserType(type: 'club' | 'formacao'): CompleteOnboardingStep[] {
  if (type === 'formacao') {
    return formationSteps;
  }
  return steps;
}
