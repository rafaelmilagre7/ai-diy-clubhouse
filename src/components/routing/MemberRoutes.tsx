
import { ReactNode } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";
import MemberSolutionRedirect from "./MemberSolutionRedirect";
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
import ImplementationTrailPage from "@/pages/member/ImplementationTrailPage";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";

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
        {/* Redirect da raiz para o dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Perfil de Implementação */}
        <Route path="perfil-de-implementacao" element={<ImplementationProfilePage />} />
        
        {/* Soluções */}
        <Route path="solutions" element={<Solutions />} />
        <Route path="solutions/:id" element={<SolutionDetails />} />
        
        {/* Compatibilidade com URLs antigas */}
        <Route path="solution/:id" element={<MemberSolutionRedirect />} />
        
        {/* Implementação de Soluções */}
        <Route path="implement/:id/:moduleIdx" element={<SolutionImplementation />} />
        <Route path="implementation/:id" element={<SolutionImplementation />} />
        <Route path="implementation/:id/:moduleIdx" element={<SolutionImplementation />} />
        <Route path="implementation-trail" element={<ImplementationTrailPage />} />
        
        {/* Páginas de erro */}
        <Route path="solution/not-found" element={<SolutionNotFound />} />
        <Route path="implementation/not-found" element={<NotFoundContent />} />
        
        {/* Perfil */}
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        
        {/* Ferramentas */}
        <Route path="tools" element={<Tools />} />
        <Route path="tools/:id" element={<ToolDetails />} />
        
        {/* Benefícios */}
        <Route path="benefits" element={<Benefits />} />
        
        {/* Sugestões */}
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="suggestions/:id" element={<SuggestionDetails />} />
        <Route path="suggestions/new" element={<NewSuggestion />} />
        
        {/* Conquistas */}
        <Route path="achievements" element={<Achievements />} />
      </Route>
    </Routes>
  );
};

export { MemberRoutes };
