
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./AuthRoutes";
import { memberRoutes } from "./MemberRoutes";
import { adminRoutes } from "./AdminRoutes";
import { certificateRoutes } from "./CertificateRoutes";
import { publicRoutes } from "./PublicRoutes";
import { formacaoRoutes } from "./FormacaoRoutes";

// Páginas de erro
import NotFound from '@/pages/NotFound';

// Páginas específicas para convites
import RegisterPage from '@/pages/auth/RegisterPage';
import OnboardingPage from '@/pages/OnboardingPage';

// Redirecionamento raiz simplificado
import SimpleRootRedirect from '@/components/routing/SimpleRootRedirect';

export const AppRoutes = createBrowserRouter([
  // Rota raiz com redirecionamento baseado em auth
  {
    path: "/",
    element: <SimpleRootRedirect />
  },

  // Rotas de autenticação (incluindo /login)
  ...authRoutes,

  // Rotas de convite (acesso principal da plataforma)
  {
    path: "/convite/:token",
    element: <RegisterPage />
  },
  {
    path: "/invite/:token", 
    element: <RegisterPage />
  },

  // Onboarding para novos usuários
  {
    path: "/onboarding",
    element: <OnboardingPage />
  },

  // Rotas de membros (protegidas)
  ...memberRoutes,

  // Rotas de admin (protegidas)
  ...adminRoutes,

  // Rotas de formação (protegidas)
  ...formacaoRoutes,

  // Rotas de certificados
  ...certificateRoutes,

  // Rota 404
  {
    path: "*",
    element: <NotFound />
  }
]);
