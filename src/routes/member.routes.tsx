
import { Fragment } from "react";
import { Route } from "react-router-dom";
import MemberLayout from "@/components/layout/MemberLayout";
import MemberSolutionRedirect from "@/components/routing/MemberSolutionRedirect";

// Páginas de membros
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
import ImplementationTrailPage from "@/pages/member/ImplementationTrailPage";
import ImplementationProfilePage from "@/pages/ImplementationProfile";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";

export const memberRoutes = (
  <Fragment>
    <Route element={<MemberLayout />}>
      {/* Dashboard */}
      <Route path="dashboard" element={<Dashboard />} />
      
      {/* Perfil de Implementação */}
      <Route path="perfil-de-implementacao" element={<ImplementationProfilePage />} />
      
      {/* Soluções */}
      <Route path="solutions" element={<Solutions />} />
      <Route path="solutions/:id" element={<SolutionDetails />} />
      
      {/* Compatibilidade com URL antiga - Redireciona para a nova estrutura */}
      <Route path="solution/:id" element={<MemberSolutionRedirect />} />
      
      {/* Implementação - Consolidado para um único formato de URL */}
      <Route path="implement/:id/:moduleIdx" element={<SolutionImplementation />} />
      <Route path="implementation-trail" element={<ImplementationTrailPage />} />
      
      {/* Páginas de erro para soluções */}
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
  </Fragment>
);
