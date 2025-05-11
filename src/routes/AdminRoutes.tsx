
import { Route } from "react-router-dom";
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

export const AdminRoutes = () => {
  return (
    <>
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/events" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminEvents />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/users" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutions />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/new" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutionCreate />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutionEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/:id/editor" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <SolutionEditor />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminTools />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools/new" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminToolEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminToolEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/suggestions" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSuggestions />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/suggestions/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSuggestionDetails />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/onboarding" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminOnboarding />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/analytics" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/roles" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <RolesPage />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/permissions/audit" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <PermissionAuditLogPage />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
    </>
  );
};
