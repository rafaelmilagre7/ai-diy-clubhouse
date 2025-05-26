
import { RouteObject } from "react-router-dom";
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionEditor from '@/pages/admin/AdminSolutionEditor';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminTools from '@/pages/admin/AdminTools';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import SupabaseDiagnostics from '@/pages/admin/SupabaseDiagnostics';

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <AdminProtectedRoutes><AdminDashboard /></AdminProtectedRoutes>
  },
  {
    path: "/admin/users",
    element: <AdminProtectedRoutes><AdminUsers /></AdminProtectedRoutes>
  },
  {
    path: "/admin/solutions",
    element: <AdminProtectedRoutes><AdminSolutions /></AdminProtectedRoutes>
  },
  {
    path: "/admin/solutions/:solutionId",
    element: <AdminProtectedRoutes><AdminSolutionEditor /></AdminProtectedRoutes>
  },
  {
    path: "/admin/analytics",
    element: <AdminProtectedRoutes><AdminAnalytics /></AdminProtectedRoutes>
  },
  {
    path: "/admin/tools",
    element: <AdminProtectedRoutes><AdminTools /></AdminProtectedRoutes>
  },
  {
    path: "/admin/onboarding",
    element: <AdminProtectedRoutes><AdminOnboarding /></AdminProtectedRoutes>
  },
  {
    path: "/admin/events",
    element: <AdminProtectedRoutes><AdminEvents /></AdminProtectedRoutes>
  },
  {
    path: "/admin/roles",
    element: <AdminProtectedRoutes><AdminRoles /></AdminProtectedRoutes>
  },
  {
    path: "/admin/diagnostics",
    element: <AdminProtectedRoutes><SupabaseDiagnostics /></AdminProtectedRoutes>
  }
];
