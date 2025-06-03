
import { CompleteOnboardingStep } from "@/types/onboarding";

// Definição das etapas do onboarding NOVO (simplificado e moderno)
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
    id: "ai_experience",
    title: "Experiência com IA", 
    section: "ai_experience",
    path: "/onboarding/ai-experience",
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

// Etapas específicas para a formação (mantidas)
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
