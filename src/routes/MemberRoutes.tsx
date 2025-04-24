
import { Fragment } from "react";
import { Route } from "react-router-dom";
import { lazy } from "react";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import MemberLayout from "@/components/layout/MemberLayout";

const MemberDashboard = lazy(() => import("@/pages/member/Dashboard"));
const Solutions = lazy(() => import("@/pages/member/Solutions"));
const SolutionDetails = lazy(() => import("@/pages/member/SolutionDetails"));
const SolutionImplementation = lazy(() => import("@/pages/member/SolutionImplementation"));
const Profile = lazy(() => import("@/pages/member/Profile"));
const EditProfile = lazy(() => import("@/pages/member/EditProfile"));
const Tools = lazy(() => import("@/pages/member/Tools"));
const ToolDetails = lazy(() => import("@/pages/member/ToolDetails"));
const Suggestions = lazy(() => import("@/pages/member/Suggestions"));
const SuggestionDetails = lazy(() => import("@/pages/member/SuggestionDetails"));
const NewSuggestion = lazy(() => import("@/pages/member/NewSuggestion"));
const Achievements = lazy(() => import("@/pages/member/Achievements"));

// Componente encapsulador para as rotas protegidas com MemberLayout
interface ProtectedMemberRouteProps {
  path: string;
  element: React.ReactNode;
}

const ProtectedMemberRoute = ({ path, element }: ProtectedMemberRouteProps) => (
  <Route
    path={path}
    element={
      <ProtectedRoute>
        <MemberLayout>{element}</MemberLayout>
      </ProtectedRoute>
    }
  />
);

export const MemberRoutes = () => {
  return (
    <Fragment>
      <ProtectedMemberRoute
        path="/dashboard"
        element={<MemberDashboard />}
      />
      
      <ProtectedMemberRoute
        path="/solutions"
        element={<Solutions />}
      />
      
      <ProtectedMemberRoute
        path="/solutions/:id"
        element={<SolutionDetails />}
      />
      
      <ProtectedMemberRoute
        path="/implement/:id/:moduleIdx"
        element={<SolutionImplementation />}
      />
      
      <ProtectedMemberRoute
        path="/profile"
        element={<Profile />}
      />
      
      <ProtectedMemberRoute
        path="/profile/edit"
        element={<EditProfile />}
      />
      
      <ProtectedMemberRoute
        path="/tools"
        element={<Tools />}
      />
      
      <ProtectedMemberRoute
        path="/tools/:id"
        element={<ToolDetails />}
      />
      
      <ProtectedMemberRoute
        path="/suggestions"
        element={<Suggestions />}
      />
      
      <ProtectedMemberRoute
        path="/suggestions/:id"
        element={<SuggestionDetails />}
      />
      
      <ProtectedMemberRoute
        path="/suggestions/new"
        element={<NewSuggestion />}
      />
      
      <ProtectedMemberRoute
        path="/achievements"
        element={<Achievements />}
      />
    </Fragment>
  );
};
