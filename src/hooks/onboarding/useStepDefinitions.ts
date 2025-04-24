
import { OnboardingStep } from "@/types/onboarding";

// Definição das etapas do onboarding
export const steps: OnboardingStep[] = [
  {
    id: "personal",
    title: "Dados Pessoais",
    section: "personal_info",
    path: "/onboarding", 
    pathAlias: "/onboarding/personal", // Adicionando alias para compatibilidade
    fields: ["name", "email", "phone", "ddi", "linkedin", "instagram", "country", "state", "city", "timezone"]
  },
  {
    id: "professional_data",
    title: "Dados Profissionais",
    section: "professional_info",
    // Define ambas as rotas como válidas para este ID
    path: "/onboarding/professional-data", 
    pathAlias: "/onboarding/professional", // Adicionando alias para compatibilidade
    fields: ["company_name", "company_size", "company_sector", "company_website", "current_position", "annual_revenue"]
  },
  {
    id: "business_context",
    title: "Contexto do Negócio",
    section: "business_context",
    path: "/onboarding/business-context",
    fields: ["business_model", "business_challenges", "short_term_goals", "medium_term_goals", "important_kpis", "additional_context"]
  },
  {
    id: "ai_exp",
    title: "Experiência com IA",
    section: "ai_experience",
    path: "/onboarding/ai-experience",
    fields: ["knowledge_level", "previous_tools", "has_implemented", "desired_ai_areas", "completed_formation", "is_member_for_month", "nps_score", "improvement_suggestions"]
  },
  {
    id: "business_goals",
    title: "Objetivos com o Club",
    section: "business_goals",
    path: "/onboarding/club-goals",
    fields: ["primary_goal", "expected_outcomes", "expected_outcome_30days", "timeline", "priority_solution_type", "how_implement", "week_availability", "live_interest", "content_formats"]
  },
  {
    id: "experience_personalization",
    title: "Personalização da Experiência",
    section: "experience_personalization",
    path: "/onboarding/customization",
    fields: ["interests", "time_preference", "available_days", "networking_availability", "skills_to_share", "mentorship_topics"]
  },
  {
    id: "complementary_info",
    title: "Informações Complementares",
    section: "complementary_info",
    path: "/onboarding/complementary",
    fields: ["how_found_us", "referred_by", "authorize_case_usage", "interested_in_interview", "priority_topics"]
  },
  {
    id: "review",
    title: "Revisar e Finalizar",
    path: "/onboarding/review",
    section: "review" as any, // Casting para evitar erro de tipo
    fields: []
  },
  {
    id: "trail_generation",
    title: "Sua Trilha Personalizada",
    path: "/onboarding/trail-generation",
    section: "trail_generation" as any, // Casting para evitar erro de tipo
    fields: []
  }
];

// Adicionando um hook simples para acessar as definições dos passos
export function useStepDefinitions() {
  return { steps };
}
