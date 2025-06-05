
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import ModernOnboardingPage from '@/pages/onboarding/ModernOnboardingPage';
import OnboardingCompletedNewPage from '@/pages/onboarding/OnboardingCompletedNew';

export const onboardingRoutes: RouteObject[] = [
  // Rota principal do onboarding - nova experiência moderna
  {
    path: "/onboarding",
    element: <ProtectedRoutes><ModernOnboardingPage /></ProtectedRoutes>
  },
  // Rota do novo onboarding moderno
  {
    path: "/onboarding-new",
    element: <ProtectedRoutes><ModernOnboardingPage /></ProtectedRoutes>
  },
  // Rota legada (compatibilidade)
  {
    path: "/onboarding-legacy",
    element: <ProtectedRoutes><NovoOnboardingNew /></ProtectedRoutes>
  },
  // Rota para a página de sucesso do onboarding
  {
    path: "/onboarding-new/completed",
    element: <ProtectedRoutes><OnboardingCompletedNewPage /></ProtectedRoutes>
  },
  // Compatibilidade com rotas antigas
  {
    path: "/onboarding/completed",
    element: <ProtectedRoutes><OnboardingCompletedNewPage /></ProtectedRoutes>
  }
];
