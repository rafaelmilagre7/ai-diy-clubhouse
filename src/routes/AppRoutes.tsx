
import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./AuthRoutes";
import { memberRoutes } from "./MemberRoutes";
import { adminRoutes } from "./AdminRoutes";
import { certificateRoutes } from "./CertificateRoutes";
import { publicRoutes } from "./PublicRoutes";
import { formacaoRoutes } from "./FormacaoRoutes";
import NotFound from '@/pages/NotFound';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import OnboardingPage from '@/pages/OnboardingPage';
import InviteInterceptor from '@/components/auth/InviteInterceptor';
import RobustRootRedirect from '@/components/routing/RobustRootRedirect';

export const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <RobustRootRedirect />
  },

  ...publicRoutes,
  ...authRoutes,

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

  {
    path: "/convite/:token",
    element: <InviteInterceptor />
  },
  {
    path: "/invite/:token", 
    element: <InviteInterceptor />
  },

  ...memberRoutes,
  ...adminRoutes,
  ...formacaoRoutes,
  ...certificateRoutes,

  {
    path: "*",
    element: <NotFound />
  }
]);
