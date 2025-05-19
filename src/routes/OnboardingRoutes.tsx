
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";
import Review from "@/pages/onboarding/Review"; // Importação da página de revisão

export const onboardingRoutes: RouteObject[] = [
  // Rota para o onboarding
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Rota para a página de revisão
  {
    path: "/onboarding/review",
    element: <ProtectedRoutes><Review /></ProtectedRoutes>
  },
  // Rota para a página de sucesso do onboarding
  {
    path: "/onboarding/completed",
    element: <ProtectedRoutes><OnboardingCompleted /></ProtectedRoutes>
  }
];
