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
const Events = lazy(() => import("@/pages/member/Events"));

export const MemberRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <MemberDashboard />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/solutions"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Solutions />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/solutions/:id"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <SolutionDetails />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/implement/:id/:moduleIdx"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <SolutionImplementation />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Profile />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <EditProfile />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/:id"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <ToolDetails />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suggestions"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Suggestions />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suggestions/:id"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <SuggestionDetails />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suggestions/new"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <NewSuggestion />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Achievements />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Events />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};
