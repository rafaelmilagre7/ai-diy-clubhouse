
import { CompleteOnboardingStep } from "@/types/onboarding";

// Definição das etapas do onboarding NOVO (simplificado e moderno)
export const steps: CompleteOnboardingStep[] = [
  {
    id: "personal_info",
    title: "Informações Pessoais",
    section: "personal_info",
    path: "/onboarding/personal-info",
    forClub: true,
    forFormation: true,
    component: () => null // placeholder component
  },
  {
    id: "ai_experience",
    title: "Experiência com IA", 
    section: "ai_experience",
    path: "/onboarding/ai-experience",
    forClub: true,
    forFormation: true,
    component: () => null // placeholder component
  },
  {
    id: "trail_generation",
    title: "Geração de Trilha",
    section: "trail_generation", 
    path: "/onboarding/trail-generation",
    forClub: true,
    component: () => null // placeholder component
  }
];

// Etapas específicas para a formação (mantidas)
export const formationSteps: CompleteOnboardingStep[] = [
  {
    id: "personal_info", 
    title: "Informações Pessoais",
    section: "personal_info",
    path: "/onboarding/formacao/personal-info",
    forFormation: true,
    component: () => null // placeholder component
  },
  {
    id: "ai_experience",
    title: "Experiência com IA",
    section: "ai_experience", 
    path: "/onboarding/formacao/ai-experience",
    forFormation: true,
    component: () => null // placeholder component
  },
  {
    id: "learning_goals",
    title: "Objetivos de Aprendizado",
    section: "formation_data",
    path: "/onboarding/formacao/goals",
    forFormation: true,
    component: () => null // placeholder component
  },
  {
    id: "learning_preferences",
    title: "Preferências de Aprendizado", 
    section: "formation_data",
    path: "/onboarding/formacao/preferences",
    forFormation: true,
    component: () => null // placeholder component
  },
  {
    id: "review",
    title: "Revisão",
    section: "review",
    path: "/onboarding/formacao/review",
    forFormation: true,
    component: () => null // placeholder component
  }
];

// Função para obter os passos com base no tipo de onboarding
export function getStepsByUserType(type: 'club' | 'formacao'): CompleteOnboardingStep[] {
  if (type === 'formacao') {
    return formationSteps;
  }
  return steps;
}
