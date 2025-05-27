
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";
import TrailGeneration from "@/pages/onboarding/steps/TrailGeneration";
import PersonalInfo from "@/pages/onboarding/steps/PersonalInfo";
import AIExperience from "@/pages/onboarding/steps/AIExperience";

export const onboardingRoutes: RouteObject[] = [
  // Rota principal do onboarding - verifica status e redireciona
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Rotas do onboarding NOVO (simplificado)
  {
    path: "/onboarding/personal-info",
    element: <ProtectedRoutes><PersonalInfo /></ProtectedRoutes>
  },
  {
    path: "/onboarding/ai-experience",
    element: <ProtectedRoutes><AIExperience /></ProtectedRoutes>
  },
  // Rota para a geração da trilha (experiência visual)
  {
    path: "/onboarding/trail-generation",
    element: <ProtectedRoutes><TrailGeneration /></ProtectedRoutes>
  },
  // Rota para a página de sucesso do onboarding
  {
    path: "/onboarding/completed",
    element: <ProtectedRoutes><OnboardingCompleted /></ProtectedRoutes>
  }
];
