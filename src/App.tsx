
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from './contexts/auth';
import { RegisterForm } from './pages/auth/Register';
import { ResetPasswordForm } from './pages/auth/ResetPassword';
import { SetNewPasswordForm } from './pages/auth/SetNewPassword';
import { ModernLoginPage } from './pages/auth/Login';
import Dashboard from './pages/member/Dashboard';
import Solutions from './pages/member/Solutions';
import SolutionDetails from './pages/member/SolutionDetails';
import ImplementationPage from './pages/member/ImplementationPage';
import Tools from './pages/member/Tools';
import CommunityRoutes from './pages/member/community/CommunityRoutes';
import ProfileRoutes from './pages/member/profile/ProfileRoutes';
import OnboardingRoutes from './pages/member/onboarding/OnboardingRoutes';
import Events from './pages/member/Events';
import ImplementationTrail from './pages/member/ImplementationTrail';
import AdminRoutes from './pages/admin/AdminRoutes';
import FormacaoRoutes from './pages/formacao/FormacaoRoutes';
import LearningRoutes from './pages/learning/LearningRoutes';
import { ProtectedRoutes } from './components/routes/ProtectedRoutes';
import { PublicRoute } from './components/routes/PublicRoute';
import { AdminProtectedRoutes } from './components/routes/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from './components/routes/FormacaoProtectedRoutes';
import ToolDetails from "@/pages/member/ToolDetails";

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <MainAppContent />
    </Router>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const MainAppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<ModernLoginPage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/set-password" element={<SetNewPasswordForm />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/:id" element={<SolutionDetails />} />
          <Route path="/implementation/:id" element={<ImplementationPage />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:id" element={<ToolDetails />} />
          <Route path="/comunidade/*" element={<CommunityRoutes />} />
          <Route path="/profile/*" element={<ProfileRoutes />} />
          <Route path="/onboarding/*" element={<OnboardingRoutes />} />
          <Route path="/events" element={<Events />} />
          <Route path="/implementation-trail" element={<ImplementationTrail />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<AdminProtectedRoutes />}>
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Route>

        {/* Formação Protected Routes */}
        <Route element={<FormacaoProtectedRoutes />}>
          <Route path="/formacao/*" element={<FormacaoRoutes />} />
        </Route>

        {/* Learning Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/learning/*" element={<LearningRoutes />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>

      <Toaster />
    </>
  );
};

export default App;
