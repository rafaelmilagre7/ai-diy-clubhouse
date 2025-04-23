
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import SolutionsPage from "@/pages/SolutionsPage";
import SolutionDetailsPage from "@/pages/SolutionDetailsPage";
import SolutionImplementation from "@/pages/SolutionImplementation";
import ToolsPage from "@/pages/ToolsPage";
import ToolDetailsPage from "@/pages/ToolDetailsPage";
import SuggestionsPage from "@/pages/SuggestionsPage";
import SuggestionDetails from "@/pages/SuggestionDetails";
import ProfilePage from "@/pages/ProfilePage";
import OnboardingPage from "@/pages/OnboardingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { adminRoutes } from "./admin.routes";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthProvider } from "@/contexts/auth";
import { PublicRoute, PrivateRoute, AdminRoute } from "@/components/routing/RoutesGuard";
import { useLogging } from "@/hooks/useLogging";

// Criar o router com todas as rotas da aplicação
const router = createBrowserRouter([
  // Rotas públicas (sem autenticação)
  {
    path: "/",
    element: (
      <AuthProvider>
        <PublicRoute>
          <AuthLayout />
        </PublicRoute>
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },

  // Rotas privadas (requer autenticação)
  {
    path: "/",
    element: (
      <AuthProvider>
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "solutions",
        element: <SolutionsPage />,
      },
      {
        path: "solution/:id",
        element: <SolutionDetailsPage />,
      },
      {
        path: "solution/:id/implementation",
        element: <SolutionImplementation />,
      },
      {
        path: "tools",
        element: <ToolsPage />,
      },
      {
        path: "tool/:id",
        element: <ToolDetailsPage />,
      },
      {
        path: "suggestions",
        element: <SuggestionsPage />,
      },
      {
        path: "suggestion/:id",
        element: <SuggestionDetails />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "onboarding",
        element: <OnboardingPage />,
      },
    ],
  },

  // Incluir todas as rotas de administração
  ...adminRoutes,

  // Rota 404 para página não encontrada
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
