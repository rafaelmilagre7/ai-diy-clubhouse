
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminInviteManager from '@/pages/admin/AdminInviteManager';
import AdminUserManager from '@/pages/admin/AdminUserManager';
import AdminCommunicationCenter from '@/pages/admin/AdminCommunicationCenter';
import AdminSolutionManager from '@/pages/admin/AdminSolutionManager';

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
          <AdminInviteManager />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout>
          <AdminUserManager />
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
          <AdminSolutionManager />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
];
