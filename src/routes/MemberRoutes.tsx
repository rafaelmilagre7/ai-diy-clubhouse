
import { Route } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import MemberLayout from "@/components/layout/MemberLayout";

const MemberDashboard = lazy(() => import("@/pages/member/Dashboard"));
const Solutions = lazy(() => import("@/pages/member/Solutions"));
const SolutionDetails = lazy(() => import("@/pages/member/SolutionDetails"));
const SolutionImplementation = lazy(() => import("@/pages/member/SolutionImplementation"));
const Profile = lazy(() => import("@/pages/member/Profile"));
const Tools = lazy(() => import("@/pages/member/Tools"));
const ToolDetails = lazy(() => import("@/pages/member/ToolDetails"));
const Suggestions = lazy(() => import("@/pages/member/Suggestions"));
const SuggestionDetails = lazy(() => import("@/pages/member/SuggestionDetails"));
const NewSuggestion = lazy(() => import("@/pages/member/NewSuggestion"));
const Achievements = lazy(() => import("@/pages/member/Achievements"));

export const MemberRoutes = () => {
  return (
    <>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <MemberDashboard />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/solutions"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <Solutions />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/solutions/:id"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <SolutionDetails />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/implement/:id/:moduleIdx"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <SolutionImplementation />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <Profile />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/tools"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/tools/:id"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <ToolDetails />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/suggestions"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <Suggestions />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/suggestions/:id"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <SuggestionDetails />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/suggestions/new"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <NewSuggestion />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoutes>
            <MemberLayout>
              <Achievements />
            </MemberLayout>
          </ProtectedRoutes>
        }
      />
    </>
  );
};
