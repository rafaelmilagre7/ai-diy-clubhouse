
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

// Onboarding
import OnboardingIntro from '@/pages/onboarding/OnboardingIntro';
import PersonalInfo from '@/pages/onboarding/steps/PersonalInfo';
import ProfessionalData from '@/pages/onboarding/steps/ProfessionalData';
import BusinessContext from '@/pages/onboarding/steps/BusinessContext';
import AIExperience from '@/pages/onboarding/steps/AIExperience';
import BusinessGoalsClub from '@/pages/onboarding/steps/BusinessGoalsClub';
import ExperiencePersonalization from '@/pages/onboarding/steps/ExperiencePersonalization';
import ComplementaryInfo from '@/pages/onboarding/steps/ComplementaryInfo';
import Review from '@/pages/onboarding/steps/Review';
import TrailGeneration from '@/pages/onboarding/steps/TrailGeneration';

export const onboardingRoutes: RouteObject[] = [
  {
    path: "/onboarding",
    element: <ProtectedRoutes><OnboardingIntro /></ProtectedRoutes>
  },
  {
    path: "/onboarding/personal-info",
    element: <ProtectedRoutes><PersonalInfo /></ProtectedRoutes>
  },
  {
    path: "/onboarding/professional-data",
    element: <ProtectedRoutes><ProfessionalData /></ProtectedRoutes>
  },
  {
    path: "/onboarding/business-context",
    element: <ProtectedRoutes><BusinessContext /></ProtectedRoutes>
  },
  {
    path: "/onboarding/ai-experience",
    element: <ProtectedRoutes><AIExperience /></ProtectedRoutes>
  },
  {
    path: "/onboarding/club-goals",
    element: <ProtectedRoutes><BusinessGoalsClub /></ProtectedRoutes>
  },
  {
    path: "/onboarding/customization",
    element: <ProtectedRoutes><ExperiencePersonalization /></ProtectedRoutes>
  },
  {
    path: "/onboarding/complementary",
    element: <ProtectedRoutes><ComplementaryInfo /></ProtectedRoutes>
  },
  {
    path: "/onboarding/review",
    element: <ProtectedRoutes><Review /></ProtectedRoutes>
  },
  {
    path: "/onboarding/trail-generation",
    element: <ProtectedRoutes><TrailGeneration /></ProtectedRoutes>
  },
];
