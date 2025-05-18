
import { RouteObject } from "react-router-dom";
import AdminProtectedRouteWithChildren from '@/components/auth/AdminProtectedRouteWithChildren';
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
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/events",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminEvents />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/users",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/solutions",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminSolutions />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/solutions/new",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminSolutionCreate />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/solutions/:id",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminSolutionEdit />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/solutions/:id/editor",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <SolutionEditor />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/tools",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminTools />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/tools/new",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/tools/:id",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/suggestions",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminSuggestions />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/suggestions/:id",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminSuggestionDetails />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/onboarding",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminOnboarding />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/analytics",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/roles",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <RolesPage />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/permissions/audit",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <PermissionAuditLogPage />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
  {
    path: "/admin/invites",
    element: (
      <AdminProtectedRouteWithChildren>
        <AdminLayout>
          <InvitesManagement />
        </AdminLayout>
      </AdminProtectedRouteWithChildren>
    )
  },
];
