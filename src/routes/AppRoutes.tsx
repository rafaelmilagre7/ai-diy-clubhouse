
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

// Auth components
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import InviteAcceptPage from '@/components/auth/InviteAcceptPage';
import InviteRegisterForm from '@/components/auth/InviteRegisterForm';

// Main components
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

// Route configurations
import { adminRoutes } from './AdminRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

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
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Invite routes - simplificadas e unificadas */}
      <Route path="/invite" element={<InviteAcceptPage />} />
      <Route path="/invite/register" element={<InviteRegisterForm />} />
      
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
          <ProtectedRoutes>
            <OnboardingWizard />
          </ProtectedRoutes>
        } 
      />

      {/* Admin routes */}
      {adminRoutes.map((route, index) => (
        <Route key={index} {...route} />
      ))}

      {/* Fallback redirect */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/dashboard" : "/"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
