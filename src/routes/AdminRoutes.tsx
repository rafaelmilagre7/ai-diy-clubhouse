
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Admin Pages - corrigindo imports para os arquivos corretos
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminCommunicationCenter from '@/pages/admin/AdminCommunicationCenter';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminTools from '@/pages/admin/AdminTools';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import SupabaseDiagnostics from '@/pages/admin/SupabaseDiagnostics';

export const adminRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/analytics",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/invites",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <InvitesManagement />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminRoles />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/communication",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminCommunicationCenter />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/solutions",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminSolutions />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tools",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminTools />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tools/:id",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminToolEdit />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/diagnostics",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <SupabaseDiagnostics />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
];
