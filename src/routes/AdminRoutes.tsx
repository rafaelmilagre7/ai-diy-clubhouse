
import { RouteObject } from "react-router-dom";
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminCommunications from '@/pages/admin/AdminCommunications';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminTools from '@/pages/admin/AdminTools';
import AdminBenefits from '@/pages/admin/AdminBenefits';
import AdminInvites from '@/pages/admin/AdminInvites';

// Função helper para criar rotas protegidas com AdminLayout
const createAdminRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: (
    <AdminProtectedRoutes>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </AdminProtectedRoutes>
  )
});

export const adminRoutes: RouteObject[] = [
  createAdminRoute("/admin", AdminDashboard),
  createAdminRoute("/admin/users", AdminUsers),
  createAdminRoute("/admin/tools", AdminTools),
  createAdminRoute("/admin/solutions", AdminSolutions),
  createAdminRoute("/admin/benefits", AdminBenefits),
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/suggestions", AdminSuggestions),
  createAdminRoute("/admin/events", AdminEvents),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", AdminInvites),
  createAdminRoute("/admin/communications", AdminCommunications),
];
