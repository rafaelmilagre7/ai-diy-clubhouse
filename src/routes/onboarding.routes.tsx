
import { RouteObject } from 'react-router-dom';
import Onboarding from '@/pages/onboarding/Onboarding';
import OnboardingIntro from '@/pages/onboarding/OnboardingIntro';
import Review from '@/pages/onboarding/Review'; 
import ProfessionalData from '@/pages/onboarding/steps/ProfessionalData';
import BusinessContext from '@/pages/onboarding/steps/BusinessContext';
import AIExperience from '@/pages/onboarding/steps/AIExperience';
import BusinessGoalsClub from '@/pages/onboarding/steps/BusinessGoalsClub';
import ExperiencePersonalization from '@/pages/onboarding/steps/ExperiencePersonalization';
import ComplementaryInfo from '@/pages/onboarding/steps/ComplementaryInfo';
import { NotFound } from '@/pages/NotFound';

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding/intro',
    element: <OnboardingIntro />,
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  // Garantir que a rota antiga aponte para o mesmo componente da nova
  {
    path: '/onboarding/professional',
    element: <ProfessionalData />,
  },
  {
    path: '/onboarding/professional-data',
    element: <ProfessionalData />,
  },
  {
    path: '/onboarding/business-context',
    element: <BusinessContext />,
  },
  {
    path: '/onboarding/club-goals',
    element: <BusinessGoalsClub />,
  },
  {
    path: '/onboarding/ai-experience',
    element: <AIExperience />,
  },
  {
    path: '/onboarding/customization',
    element: <ExperiencePersonalization />,
  },
  {
    path: '/onboarding/complementary',
    element: <ComplementaryInfo />,
  },
  {
    path: '/onboarding/review',
    element: <Review />,
  },
  // Rota curinga para capturar URLs inválidas dentro do onboarding
  {
    path: '/onboarding/*',
    element: <NotFound />,
  }
];
