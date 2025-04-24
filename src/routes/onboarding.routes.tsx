
import { RouteObject } from 'react-router-dom';
import { NotFound } from '@/pages/NotFound';

// Como estamos removendo o onboarding, este arquivo apenas mantém a estrutura
// mas não define mais nenhuma rota de onboarding
export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding/*',
    element: <NotFound />,
  }
];
