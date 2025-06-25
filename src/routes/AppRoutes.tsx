
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./AuthRoutes";
import { memberRoutes } from "./MemberRoutes";
import { adminRoutes } from "./AdminRoutes";
import { certificateRoutes } from "./CertificateRoutes";
import { publicRoutes } from "./PublicRoutes";
import { formacaoRoutes } from "./FormacaoRoutes";

// Páginas de erro
import NotFound from '@/pages/NotFound';

// Páginas existentes para rotas específicas
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import OnboardingPage from '@/pages/OnboardingPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Usar o redirect otimizado
import FastRootRedirect from '@/components/routing/FastRootRedirect';

export const AppRoutes = createBrowserRouter([
  // Rota raiz com redirecionamento otimizado
  {
    path: "/",
    element: <FastRootRedirect />
  },

  // Rotas públicas
  ...publicRoutes,

  // Rotas de autenticação
  ...authRoutes,

  // Rotas específicas de auth
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/set-new-password", 
    element: <SetNewPassword />
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />
  },

  // Rotas de convite
  {
    path: "/convite/:token",
    element: <RegisterPage />
  },
  {
    path: "/invite/:token",
    element: <RegisterPage />
  },

  // Rotas de membros (já usando RobustProtectedRoutes)
  ...memberRoutes,

  // Rotas de admin
  ...adminRoutes,

  // Rotas de formação
  ...formacaoRoutes,

  // Rotas de certificados
  ...certificateRoutes,

  // Rota 404
  {
    path: "*",
    element: <NotFound />
  }
]);
