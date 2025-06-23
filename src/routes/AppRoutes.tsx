
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
import { formacaoRoutes } from './FormacaoRoutes';

// Admin pages
import AdminLayout from '@/components/layout/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTools from '@/pages/admin/AdminTools';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import WhatsAppDebug from '@/pages/admin/WhatsAppDebug';
import EmailDebug from '@/pages/admin/EmailDebug';
import AdminCommunications from '@/pages/admin/AdminCommunications';
import SupabaseDiagnostics from '@/pages/admin/SupabaseDiagnostics';
import AdminSecurity from '@/pages/admin/AdminSecurity';

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

      {/* Admin routes - expanded individually */}
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
        path="/admin/tools/new" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminToolEdit />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/tools/:id" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminToolEdit />
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
        path="/admin/solutions/new" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminSolutionCreate />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/solutions/:id" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <SolutionEditor />
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
        path="/admin/suggestions" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminSuggestions />
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
        path="/admin/roles" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminRoles />
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
      <Route 
        path="/admin/communications" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminCommunications />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/security" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <AdminSecurity />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/whatsapp-debug" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <WhatsAppDebug />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/email-debug" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <EmailDebug />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/diagnostics" 
        element={
          <ProtectedRoutes>
            <AdminLayout>
              <SupabaseDiagnostics />
            </AdminLayout>
          </ProtectedRoutes>
        } 
      />

      {/* LMS/Formacao routes - expanded individually */}
      {formacaoRoutes.map((route, index) => (
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
