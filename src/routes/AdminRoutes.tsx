
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Admin pages - usando versões otimizadas
import OptimizedAdminDashboard from '@/pages/admin/OptimizedAdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTools from '@/pages/admin/AdminTools';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionEdit from '@/pages/admin/AdminSolutionEdit';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import CommunityModerationPage from '@/pages/admin/community/CommunityModerationPage';
import PerformanceDashboard from '@/components/admin/performance/PerformanceDashboard';
import AdminNetworkingPage from '@/pages/admin/networking/AdminNetworkingPage';

// Função helper para criar rotas protegidas com AdminLayout
const createAdminRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><AdminLayout><Component /></AdminLayout></ProtectedRoutes>
});

export const adminRoutes: RouteObject[] = [
  createAdminRoute("/admin", OptimizedAdminDashboard),
  createAdminRoute("/admin/users", AdminUsers),
  createAdminRoute("/admin/tools", AdminTools),
  createAdminRoute("/admin/tools/new", AdminToolEdit),
  createAdminRoute("/admin/tools/:id", AdminToolEdit),
  createAdminRoute("/admin/solutions", AdminSolutions),
  createAdminRoute("/admin/solutions/new", AdminSolutionCreate),
  createAdminRoute("/admin/solutions/:id", AdminSolutionEdit),
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/performance", PerformanceDashboard),
  createAdminRoute("/admin/onboarding", AdminOnboarding),
  createAdminRoute("/admin/suggestions", AdminSuggestions),
  createAdminRoute("/admin/events", AdminEvents),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", InvitesManagement),
  createAdminRoute("/admin/community", CommunityModerationPage),
  createAdminRoute("/admin/networking", AdminNetworkingPage),
];
