
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
const Events = lazy(() => import("@/pages/member/Events"));

// Páginas de formação/learning
const LearningPage = lazy(() => import("@/pages/member/learning/LearningPage"));
const CourseDetails = lazy(() => import("@/pages/member/learning/CourseDetails"));
const LessonView = lazy(() => import("@/pages/member/learning/LessonView"));

// Páginas de onboarding
const Onboarding = lazy(() => import("@/pages/onboarding/Onboarding"));
const PersonalInfo = lazy(() => import("@/pages/onboarding/steps/PersonalInfo"));
const ProfessionalData = lazy(() => import("@/pages/onboarding/steps/ProfessionalData"));
const BusinessContext = lazy(() => import("@/pages/onboarding/steps/BusinessContext"));
const AIExperience = lazy(() => import("@/pages/onboarding/steps/AIExperience"));
const BusinessGoals = lazy(() => import("@/pages/onboarding/steps/BusinessGoals"));
const ExperiencePersonalization = lazy(() => import("@/pages/onboarding/steps/ExperiencePersonalization"));
const ComplementaryInfo = lazy(() => import("@/pages/onboarding/steps/ComplementaryInfo"));
const Review = lazy(() => import("@/pages/onboarding/Review"));

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
        path="/events"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Events />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Rotas de Learning/Formação */}
      <Route
        path="/learning"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LearningPage />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning/course/:id"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <CourseDetails />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning/course/:courseId/lesson/:lessonId"
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LessonView />
            </MemberLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Rotas de Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/professional-data"
        element={
          <ProtectedRoute>
            <ProfessionalData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/business-context"
        element={
          <ProtectedRoute>
            <BusinessContext />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/ai-experience"
        element={
          <ProtectedRoute>
            <AIExperience />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/club-goals"
        element={
          <ProtectedRoute>
            <BusinessGoals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/customization"
        element={
          <ProtectedRoute>
            <ExperiencePersonalization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/complementary"
        element={
          <ProtectedRoute>
            <ComplementaryInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/review"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};
