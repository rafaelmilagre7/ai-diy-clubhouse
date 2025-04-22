
import { RouteObject } from 'react-router-dom';
import Onboarding from '@/pages/onboarding/Onboarding';

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/professional',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/business-context',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/business-goals',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/ai-experience',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/personalization',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/complementary',
    element: <Onboarding />,
  },
  {
    path: '/onboarding/review',
    element: <Onboarding />,
  },
];
