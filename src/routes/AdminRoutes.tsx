
import { RouteObject } from "react-router-dom";
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
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
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/events",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminEvents />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/users",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/solutions",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminSolutions />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/solutions/new",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminSolutionCreate />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/solutions/:id",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminSolutionEdit />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/solutions/:id/editor",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <SolutionEditor />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/tools",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminTools />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/tools/new",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/tools/:id",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/suggestions",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminSuggestions />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/suggestions/:id",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminSuggestionDetails />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/onboarding",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminOnboarding />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/analytics",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/roles",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <RolesPage />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/permissions/audit",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <PermissionAuditLogPage />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
  {
    path: "/admin/invites",
    element: (
      <AdminProtectedRoutes>
        <AdminLayout>
          <InvitesManagement />
        </AdminLayout>
      </AdminProtectedRoutes>
    )
  },
];
