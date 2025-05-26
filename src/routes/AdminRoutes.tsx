
import { RouteObject } from "react-router-dom";
import AdminRoute from '@/components/routing/AdminRoute';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminTools from '@/pages/admin/AdminTools';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminSolutionEdit from '@/pages/admin/AdminSolutionEdit';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';
import AdminEvents from '@/pages/admin/AdminEvents';
import RolesPage from '@/pages/admin/RolesPage';
import PermissionAuditLogPage from '@/pages/admin/PermissionAuditLogPage';
import InvitesManagement from '@/pages/admin/InvitesManagement';

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/events",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminEvents />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/solutions",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminSolutions />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/solutions/new",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminSolutionCreate />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/solutions/:id",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminSolutionEdit />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/solutions/:id/editor",
    element: (
      <AdminRoute>
        <AdminLayout>
          <SolutionEditor />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/tools",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminTools />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/tools/new",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/tools/:id",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/suggestions",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminSuggestions />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/suggestions/:id",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminSuggestionDetails />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/onboarding",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminOnboarding />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/analytics",
    element: (
      <AdminRoute>
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/roles",
    element: (
      <AdminRoute>
        <AdminLayout>
          <RolesPage />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/permissions/audit",
    element: (
      <AdminRoute>
        <AdminLayout>
          <PermissionAuditLogPage />
        </AdminLayout>
      </AdminRoute>
    )
  },
  {
    path: "/admin/invites",
    element: (
      <AdminRoute>
        <AdminLayout>
          <InvitesManagement />
        </AdminLayout>
      </AdminRoute>
    )
  },
];
