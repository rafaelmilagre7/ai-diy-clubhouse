
import { OnboardingStep } from "@/types/onboarding";

// Definição das etapas do onboarding
export const steps: OnboardingStep[] = [
  {
    id: "personal",
    title: "Dados Pessoais",
    section: "personal_info",
    path: "/onboarding"
  },
  {
    id: "professional_data",
    title: "Dados Profissionais",
    section: "professional_info",
    path: "/onboarding/professional-data"
  },
  {
    id: "business_context",
    title: "Contexto do Negócio",
    section: "business_context",
    path: "/onboarding/business-context"
  },
  {
    id: "ai_exp",
    title: "Experiência com IA",
    section: "ai_experience",
    path: "/onboarding/ai-experience"
  },
  {
    id: "business_goals",
    title: "Objetivos com o Club",
    section: "business_goals",
    path: "/onboarding/club-goals"
  },
  {
    id: "experience_personalization",
    title: "Personalização da Experiência",
    section: "experience_personalization",
    path: "/onboarding/customization"
  },
  {
    id: "complementary_info",
    title: "Informações Complementares",
    section: "complementary_info",
    path: "/onboarding/complementary"
  },
  {
    id: "review",
    title: "Revisar e Finalizar",
    section: "review",
    path: "/onboarding/review"
  },
  {
    id: "trail_generation",
    title: "Sua Trilha Personalizada",
    section: "trail_generation",
    path: "/onboarding/trail-generation"
  }
];
