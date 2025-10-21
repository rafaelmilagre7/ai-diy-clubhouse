
import { RouteObject } from "react-router-dom";
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';

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
import EventsDebugPage from '@/pages/admin/EventsDebugPage';
import AdminRoles from '@/pages/admin/AdminRoles';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import InviteDebug from '@/pages/admin/InviteDebug';
import BenefitStats from '@/pages/admin/BenefitStats';
import WhatsAppDebug from '@/pages/admin/WhatsAppDebug';
import AdminCommunications from '@/pages/admin/AdminCommunications';
import SupabaseDiagnostics from '@/pages/admin/SupabaseDiagnostics';
import AdminSecurity from '@/pages/admin/AdminSecurity';
import IntegrationsDebugPage from '@/pages/admin/IntegrationsDebugPage';
import DataAuditPage from '@/pages/admin/DataAudit';
import HublaWebhooks from '@/pages/admin/HublaWebhooks';
import AdminAutomations from '@/pages/admin/AdminAutomations';
import AutomationForm from '@/pages/admin/AutomationForm';
import AutomationLogs from '@/pages/admin/AutomationLogs';
import SolutionAccessOverrides from '@/pages/admin/SolutionAccessOverrides';
import StyleGuidePage from '@/pages/StyleGuidePage';
import AdminNetworking from '@/pages/admin/AdminNetworking';

import NPSAnalytics from '@/pages/admin/NPSAnalytics';
import CertificateTemplates from '@/pages/admin/CertificateTemplates';
import CourseCertificateManager from '@/pages/admin/CourseCertificateManager';
import NotificationsStats from '@/pages/admin/NotificationsStats';


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
  createAdminRoute("/admin/tools/new", AdminToolEdit),
  createAdminRoute("/admin/tools/:id", AdminToolEdit),
  createAdminRoute("/admin/benefits", BenefitStats),
  createAdminRoute("/admin/solutions", AdminSolutions),
  createAdminRoute("/admin/solutions/new", AdminSolutionCreate),
  createAdminRoute("/admin/solutions/:id", SolutionEditor),
  createAdminRoute("/admin/solution-overrides", SolutionAccessOverrides),
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/suggestions", AdminSuggestions),
  createAdminRoute("/admin/events/debug", EventsDebugPage),
  createAdminRoute("/admin/events", AdminEvents),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", InvitesManagement),
  createAdminRoute("/admin/invite-debug", InviteDebug),
  createAdminRoute("/admin/communications", AdminCommunications),
  createAdminRoute("/admin/security", AdminSecurity),
  createAdminRoute("/admin/whatsapp-debug", WhatsAppDebug),
  createAdminRoute("/admin/integrations-debug", IntegrationsDebugPage),
  createAdminRoute("/admin/diagnostics", SupabaseDiagnostics),
  
  createAdminRoute("/admin/nps", NPSAnalytics),
  createAdminRoute("/admin/certificate-templates", CertificateTemplates),
  createAdminRoute("/admin/course-certificates", CourseCertificateManager),
  createAdminRoute("/admin/notifications/stats", NotificationsStats),
  
  createAdminRoute("/admin/data-audit", DataAuditPage),
  createAdminRoute("/admin/hubla-webhooks", HublaWebhooks),
  createAdminRoute("/admin/automations", AdminAutomations),
  createAdminRoute("/admin/automations/new", AutomationForm),
  createAdminRoute("/admin/automations/logs", AutomationLogs),
  createAdminRoute("/admin/automations/:id", AutomationForm),
  createAdminRoute("/admin/style-guide", StyleGuidePage),
  createAdminRoute("/admin/networking", AdminNetworking),
];
