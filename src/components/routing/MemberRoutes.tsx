
import { ReactNode } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";
import Dashboard from "@/pages/member/Dashboard";
import Solutions from "@/pages/member/Solutions";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";
import Profile from "@/pages/member/Profile";
import EditProfile from "@/pages/member/EditProfile";
import Tools from "@/pages/member/Tools";
import ToolDetails from "@/pages/member/ToolDetails";
import Suggestions from "@/pages/member/Suggestions";
import SuggestionDetails from "@/pages/member/SuggestionDetails";
import NewSuggestion from "@/pages/member/NewSuggestion";
import Achievements from "@/pages/member/Achievements";
import Benefits from "@/pages/member/Benefits";
import { lazy, Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Importar com lazy loading para reduzir o tamanho inicial do bundle
const Onboarding = lazy(() => import("@/pages/onboarding/Onboarding"));
const OnboardingBusinessGoals = lazy(() => import("@/pages/onboarding/steps/BusinessGoals"));
const OnboardingAIExperience = lazy(() => import("@/pages/onboarding/steps/AIExperience"));
const OnboardingIndustryFocus = lazy(() => import("@/pages/onboarding/steps/IndustryFocus"));
const OnboardingResourcesNeeds = lazy(() => import("@/pages/onboarding/steps/ResourcesNeeds"));
const OnboardingTeamInfo = lazy(() => import("@/pages/onboarding/steps/TeamInfo"));
const OnboardingPreferences = lazy(() => import("@/pages/onboarding/steps/Preferences"));

interface MemberRoutesProps {
  children?: ReactNode;
}

/**
 * MemberRoutes configura as rotas para membros da aplicação
 */
const MemberRoutes = ({ children }: MemberRoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={<MemberLayout>{children}</MemberLayout>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Onboarding Routes - com suspense para carregamento lazy */}
        <Route path="onboarding" element={
          <Suspense fallback={<LoadingScreen message="Carregando onboarding..." />}>
            <Onboarding />
          </Suspense>
        } />
        
        <Route path="onboarding/business-goals" element={
          <Suspense fallback={<LoadingScreen message="Carregando próxima etapa..." />}>
            <OnboardingBusinessGoals />
          </Suspense>
        } />
        
        <Route path="onboarding/ai-experience" element={
          <Suspense fallback={<LoadingScreen message="Carregando próxima etapa..." />}>
            <OnboardingAIExperience />
          </Suspense>
        } />
        
        <Route path="onboarding/industry-focus" element={
          <Suspense fallback={<LoadingScreen message="Carregando próxima etapa..." />}>
            <OnboardingIndustryFocus />
          </Suspense>
        } />
        
        <Route path="onboarding/resources-needs" element={
          <Suspense fallback={<LoadingScreen message="Carregando próxima etapa..." />}>
            <OnboardingResourcesNeeds />
          </Suspense>
        } />
        
        <Route path="onboarding/team-info" element={
          <Suspense fallback={<LoadingScreen message="Carregando próxima etapa..." />}>
            <OnboardingTeamInfo />
          </Suspense>
        } />
        
        <Route path="onboarding/preferences" element={
          <Suspense fallback={<LoadingScreen message="Carregando próxima etapa..." />}>
            <OnboardingPreferences />
          </Suspense>
        } />

        {/* Outras rotas */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="solution/:id" element={<SolutionDetails />} />
        <Route path="implement/:id/:moduleIdx" element={<SolutionImplementation />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/:id" element={<ToolDetails />} />
        <Route path="benefits" element={<Benefits />} />
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="suggestions/:id" element={<SuggestionDetails />} />
        <Route path="suggestions/new" element={<NewSuggestion />} />
        <Route path="achievements" element={<Achievements />} />
      </Route>
    </Routes>
  );
};

export { MemberRoutes };
