
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
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
        <Route index element={<Dashboard />} />
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
