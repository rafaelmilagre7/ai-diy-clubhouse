
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import AdminLayout from '@/components/layout/AdminLayout';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTools from '@/pages/admin/AdminTools';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminInvites from '@/pages/admin/AdminInvites';
import AdminPermissionsAudit from '@/pages/admin/AdminPermissionsAudit';

// Community moderation
import CommunityModerationPage from '@/pages/admin/community/CommunityModerationPage';

// Função helper para criar rotas protegidas com AdminLayout
const createAdminRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes requiredRole="admin"><AdminLayout><Component /></AdminLayout></ProtectedRoutes>
});

export const adminRoutes: RouteObject[] = [
  createAdminRoute("/admin", AdminDashboard),
  createAdminRoute("/admin/users", AdminUsers),
  createAdminRoute("/admin/tools", AdminTools),
  createAdminRoute("/admin/solutions", AdminSolutions),
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/onboarding", AdminOnboarding),
  createAdminRoute("/admin/suggestions", AdminSuggestions),
  createAdminRoute("/admin/events", AdminEvents),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", AdminInvites),
  createAdminRoute("/admin/permissions/audit", AdminPermissionsAudit),
  
  // Community moderation routes
  createAdminRoute("/admin/community", CommunityModerationPage),
];
