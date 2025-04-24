
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
import ImplementationProfilePage from "@/pages/ImplementationProfile";

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
        
        {/* Perfil de Implementação */}
        <Route path="perfil-de-implementacao" element={<ImplementationProfilePage />} />

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
