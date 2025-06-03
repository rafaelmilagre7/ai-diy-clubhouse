import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Layout } from "@/components/layout/Layout";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PerformanceWrapper } from "@/components/common/performance/PerformanceWrapper";

// Lazy imports for better code splitting
const Dashboard = React.lazy(() => import("@/pages/member/Dashboard"));
const Profile = React.lazy(() => import("@/pages/member/Profile"));
const Tools = React.lazy(() => import("@/pages/member/Tools"));
const ToolDetails = React.lazy(() => import("@/pages/member/ToolDetails"));
const Solutions = React.lazy(() => import("@/pages/member/Solutions"));
const SolutionDetails = React.lazy(() => import("@/pages/member/SolutionDetails"));
const Implementation = React.lazy(() => import("@/pages/member/Implementation"));
const ImplementationCompleted = React.lazy(() => import("@/pages/member/ImplementationCompleted"));
const Comunidade = React.lazy(() => import("@/pages/member/Comunidade"));
const ComunidadeCategoria = React.lazy(() => import("@/pages/member/ComunidadeCategoria"));
const ComunidadeTopico = React.lazy(() => import("@/pages/member/ComunidadeTopico"));
const ComunidadeNovoTopico = React.lazy(() => import("@/pages/member/ComunidadeNovoTopico"));
const ImplementationTrail = React.lazy(() => import("@/pages/member/ImplementationTrail"));
const Events = React.lazy(() => import("@/pages/member/Events"));
const Learning = React.lazy(() => import("@/pages/learning/Learning"));
const Course = React.lazy(() => import("@/pages/learning/Course"));
const Lesson = React.lazy(() => import("@/pages/learning/Lesson"));
const Onboarding = React.lazy(() => import("@/pages/onboarding/Onboarding"));

export const MemberRoutes = () => {
  return (
    <PerformanceWrapper componentName="MemberRoutes">
      <Layout>
        <ErrorBoundary FallbackComponent={RouteErrorBoundary}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/:id" element={<ToolDetails />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/solution/:id" element={<SolutionDetails />} />
              <Route path="/implementation/:id" element={<Implementation />} />
              <Route path="/implementation/:id/completed" element={<ImplementationCompleted />} />
              <Route path="/implementation-trail" element={<ImplementationTrail />} />
              <Route path="/comunidade" element={<Comunidade />} />
              <Route path="/comunidade/categoria/:slug" element={<ComunidadeCategoria />} />
              <Route path="/comunidade/topico/:topicId" element={<ComunidadeTopico />} />
              <Route path="/comunidade/novo-topico/:categorySlug" element={<ComunidadeNovoTopico />} />
              <Route path="/events" element={<Events />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/learning/course/:courseId" element={<Course />} />
              <Route path="/learning/course/:courseId/lesson/:lessonId" element={<Lesson />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </PerformanceWrapper>
  );
};
