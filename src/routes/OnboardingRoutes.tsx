
import { RouteObject } from "react-router-dom";
import ProtectedRouteWithChildren from '@/components/auth/ProtectedRouteWithChildren';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";

export const onboardingRoutes: RouteObject[] = [
  // Rota para o onboarding
  {
    path: "/onboarding",
    element: <ProtectedRouteWithChildren><NovoOnboarding /></ProtectedRouteWithChildren>
  },
  // Rota para a página de sucesso do onboarding
  {
    path: "/onboarding/completed",
    element: <ProtectedRouteWithChildren><OnboardingCompleted /></ProtectedRouteWithChildren>
  }
];
