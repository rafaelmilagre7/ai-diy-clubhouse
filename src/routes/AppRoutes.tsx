
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

// Auth components
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Main components
import DashboardPage from '@/pages/DashboardPage';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import RootRedirect from '@/components/routing/RootRedirect';

// Route configurations
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { adminRoutes } from './AdminRoutes';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root route - intelligent redirect */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Invite routes */}
      <Route path="/convite/:token" element={<RegisterPage />} />
      <Route path="/invite/:token" element={<RegisterPage />} />
      <Route path="/invite" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoutes>
            <DashboardPage />
          </ProtectedRoutes>
        } 
      />
      
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoutes allowInviteFlow={true}>
            <OnboardingWizard />
          </ProtectedRoutes>
        } 
      />

      {/* Admin routes - using consolidated admin routes */}
      {adminRoutes.map((route, index) => (
        <Route key={index} {...route} />
      ))}

      {/* Fallback redirect */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
