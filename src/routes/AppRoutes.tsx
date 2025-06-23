
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

// Auth components
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Main components
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

// Route configurations
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

// Import admin routes properly
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTools from '@/pages/admin/AdminTools';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminEvents from '@/pages/admin/AdminEvents';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import AdminLayout from '@/components/layout/admin/AdminLayout';

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
      
      {/* CORREÇÃO 3: Rotas de convite melhoradas */}
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

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/tools"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminTools />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/solutions"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminSolutions />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminEvents />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/invites"
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <InvitesManagement />
            </AdminLayout>
          </ProtectedRoutes>
        }
      />

      {/* Fallback redirect */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/dashboard" : "/"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
