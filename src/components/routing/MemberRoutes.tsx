
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

import Onboarding from "@/pages/onboarding/Onboarding";
import PersonalInfo from "@/pages/onboarding/steps/PersonalInfo";
import ProfessionalData from "@/pages/onboarding/steps/ProfessionalData";
import BusinessContext from "@/pages/onboarding/steps/BusinessContext";
import AIExperience from "@/pages/onboarding/steps/AIExperience";
import BusinessGoalsClub from "@/pages/onboarding/steps/BusinessGoalsClub";
import ExperiencePersonalization from "@/pages/onboarding/steps/ExperiencePersonalization";
import ComplementaryInfo from "@/pages/onboarding/steps/ComplementaryInfo";
import Review from "@/pages/onboarding/steps/Review";
import TrailGeneration from "@/pages/onboarding/steps/TrailGeneration";

interface MemberRoutesProps {
  children?: ReactNode;
}

/**
 * MemberRoutes configura as rotas para membros da aplicação
 */
const MemberRoutes = ({ children }: MemberRoutesProps) => {
  return (
    <Routes>
      <Route element={<MemberLayout>{children}</MemberLayout>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="onboarding/personal" element={<PersonalInfo />} />
        <Route path="onboarding/professional" element={<ProfessionalData />} />
        <Route path="onboarding/professional-data" element={<ProfessionalData />} />
        <Route path="onboarding/business-context" element={<BusinessContext />} />
        <Route path="onboarding/ai-experience" element={<AIExperience />} />
        <Route path="onboarding/club-goals" element={<BusinessGoalsClub />} />
        <Route path="onboarding/customization" element={<ExperiencePersonalization />} />
        <Route path="onboarding/complementary" element={<ComplementaryInfo />} />
        <Route path="onboarding/review" element={<Review />} />
        <Route path="onboarding/trail-generation" element={<TrailGeneration />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="solution/:id" element={<SolutionDetails />} />
        <Route path="implement/:id/:moduleIdx" element={<SolutionImplementation />} />
        <Route path="implementation/:id" element={<SolutionImplementation />} />
        <Route path="implementation/:id/:moduleIdx" element={<SolutionImplementation />} />
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
