
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboarding from '@/pages/onboarding/NovoOnboarding';
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";
import Review from "@/pages/onboarding/Review";
import TrailGeneration from "@/pages/onboarding/steps/TrailGeneration";
import PersonalInfo from "@/pages/onboarding/steps/PersonalInfo";
import ProfessionalData from "@/pages/onboarding/steps/ProfessionalData";
import BusinessContext from "@/pages/onboarding/steps/BusinessContext";
import AIExperience from "@/pages/onboarding/steps/AIExperience";
import ClubGoals from "@/pages/onboarding/steps/ClubGoals";
import Customization from "@/pages/onboarding/steps/Customization";
import Complementary from "@/pages/onboarding/steps/Complementary";

export const onboardingRoutes: RouteObject[] = [
  // Rota principal do onboarding - verifica status e redireciona
  {
    path: "/onboarding",
    element: <ProtectedRoutes><NovoOnboarding /></ProtectedRoutes>
  },
  // Rotas específicas do onboarding apontam diretamente para componentes
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
    element: <ProtectedRoutes><ClubGoals /></ProtectedRoutes>
  },
  {
    path: "/onboarding/customization",
    element: <ProtectedRoutes><Customization /></ProtectedRoutes>
  },
  {
    path: "/onboarding/complementary",
    element: <ProtectedRoutes><Complementary /></ProtectedRoutes>
  },
  // Rota para a página de revisão
  {
    path: "/onboarding/review",
    element: <ProtectedRoutes><Review /></ProtectedRoutes>
  },
  // Rota para a geração da trilha
  {
    path: "/onboarding/trail-generation",
    element: <ProtectedRoutes><TrailGeneration /></ProtectedRoutes>
  },
  // Rota para a página de sucesso do onboarding
  {
    path: "/onboarding/completed",
    element: <ProtectedRoutes><OnboardingCompleted /></ProtectedRoutes>
  }
];
