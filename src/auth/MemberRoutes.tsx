
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Layout from "@/components/layout/Layout";
import RouteErrorBoundary from "@/components/common/RouteErrorBoundary";
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
const Events = React.lazy(() => import("@/pages/member/Events"));

// Wrapper para adaptar RouteErrorBoundary ao react-error-boundary
const RouteErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <RouteErrorBoundary>
      <div>Erro na rota</div>
    </RouteErrorBoundary>
  );
};

export const MemberRoutes = () => {
  return (
    <PerformanceWrapper componentName="MemberRoutes">
      <Layout>
        <ErrorBoundary FallbackComponent={RouteErrorFallback}>
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
              <Route path="/events" element={<Events />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </PerformanceWrapper>
  );
};
