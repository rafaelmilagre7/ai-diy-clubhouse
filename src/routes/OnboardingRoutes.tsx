
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import OnboardingCompletedNewPage from '@/pages/onboarding/OnboardingCompletedNew';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";

export const onboardingRoutes: RouteObject[] = [
  // Rota principal do onboarding - experiência one-page
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Nova rota do onboarding moderno
  {
    path: "/onboarding-new",
    element: <ProtectedRoutes><NovoOnboardingNew /></ProtectedRoutes>
  },
  // Rota para a página de sucesso do onboarding
  {
    path: "/onboarding/completed",
    element: <ProtectedRoutes><OnboardingCompleted /></ProtectedRoutes>
  },
  // Nova rota para a página de sucesso do onboarding novo
  {
    path: "/onboarding-new/completed",
    element: <ProtectedRoutes><OnboardingCompletedNewPage /></ProtectedRoutes>
  }
];
