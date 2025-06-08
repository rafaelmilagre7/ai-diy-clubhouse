
import { RouteObject } from "react-router-dom";
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import AdminLayout from '@/components/layout/AdminLayout';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTools from '@/pages/admin/AdminTools';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import BenefitStats from '@/pages/admin/BenefitStats';
import WhatsAppDebug from '@/pages/admin/WhatsAppDebug';
import AdminCommunications from '@/pages/admin/AdminCommunications';

// Função helper para criar rotas protegidas com AdminLayout
const createAdminRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <AdminProtectedRoutes><AdminLayout><Component /></AdminLayout></AdminProtectedRoutes>
});

export const adminRoutes: RouteObject[] = [
  createAdminRoute("/admin", AdminDashboard),
  createAdminRoute("/admin/users", AdminUsers),
  createAdminRoute("/admin/tools", AdminTools),
  createAdminRoute("/admin/tools/new", AdminToolEdit),
  createAdminRoute("/admin/tools/:id", AdminToolEdit),
  createAdminRoute("/admin/benefits", BenefitStats),
  createAdminRoute("/admin/solutions", AdminSolutions),
  createAdminRoute("/admin/solutions/new", AdminSolutionCreate),
  createAdminRoute("/admin/solutions/:id", SolutionEditor),
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/suggestions", AdminSuggestions),
  createAdminRoute("/admin/events", AdminEvents),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", InvitesManagement),
  createAdminRoute("/admin/communications", AdminCommunications),
  createAdminRoute("/admin/whatsapp-debug", WhatsAppDebug),
];
