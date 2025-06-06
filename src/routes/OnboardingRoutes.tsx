
import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

// TEMPORÁRIO: Rotas de onboarding desabilitadas - redirecionam para dashboard
export const onboardingRoutes: RouteObject[] = [
  {
    path: "/onboarding",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/onboarding-new",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/onboarding-legacy",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/onboarding-new/completed",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/onboarding/completed",
    element: <Navigate to="/dashboard" replace />
  }
];
