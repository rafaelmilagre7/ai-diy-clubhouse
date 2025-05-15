
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import PersonalInfo from '@/pages/onboarding/steps/PersonalInfo';

export const onboardingRoutes: RouteObject[] = [
  // Rota principal para o novo onboarding
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Rota para informações pessoais
  {
    path: "/onboarding/personal-info",
    element: <ProtectedRoutes><PersonalInfo /></ProtectedRoutes>
  }
];
