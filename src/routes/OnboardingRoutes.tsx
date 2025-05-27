
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";
import Review from "@/pages/onboarding/Review";
import TrailGeneration from "@/pages/onboarding/steps/TrailGeneration";

export const onboardingRoutes: RouteObject[] = [
  // Rota principal do onboarding - sempre redireciona para o sistema novo
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Todas as rotas específicas do novo sistema
  {
    path: "/onboarding/personal-info",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  {
    path: "/onboarding/professional-data", 
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  {
    path: "/onboarding/business-context",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  {
    path: "/onboarding/ai-experience",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  {
    path: "/onboarding/club-goals",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  {
    path: "/onboarding/customization",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  {
    path: "/onboarding/complementary",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Rota para a página de revisão
  {
    path: "/onboarding/review",
    element: <ProtectedRoutes><Review /></ProtectedRoutes>
  },
  // Rota para a geração da trilha
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
