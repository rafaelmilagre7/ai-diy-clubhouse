
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import OnboardingCompletedNewPage from '@/pages/onboarding/OnboardingCompletedNew';

export const onboardingRoutes: RouteObject[] = [
  // Rota principal do onboarding - redireciona para o novo sistema
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboardingNew /></ProtectedRoutes>
  },
  // Rota do novo onboarding moderno
  {
    path: "/onboarding-new",
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
