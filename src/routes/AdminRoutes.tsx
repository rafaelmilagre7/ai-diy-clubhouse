
import { RouteObject } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import OptimizedLoadingScreen from '@/components/common/OptimizedLoadingScreen';

// Lazy loading de páginas administrativas para melhor performance
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminTools = lazy(() => import('@/pages/admin/AdminTools'));
const AdminToolEdit = lazy(() => import('@/pages/admin/AdminToolEdit'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSolutionCreate = lazy(() => import('@/pages/admin/AdminSolutionCreate'));
const SolutionEditor = lazy(() => import('@/pages/admin/SolutionEditor'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminSuggestions = lazy(() => import('@/pages/admin/AdminSuggestions'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const EventsDebugPage = lazy(() => import('@/pages/admin/EventsDebugPage'));
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'));
const InvitesManagement = lazy(() => import('@/pages/admin/invites/InvitesManagement'));
const InviteDebug = lazy(() => import('@/pages/admin/InviteDebug'));
const BenefitStats = lazy(() => import('@/pages/admin/BenefitStats'));
const WhatsAppDebug = lazy(() => import('@/pages/admin/WhatsAppDebug'));
const AdminCommunications = lazy(() => import('@/pages/admin/AdminCommunications'));
const SupabaseDiagnostics = lazy(() => import('@/pages/admin/SupabaseDiagnostics'));
const AdminSecurity = lazy(() => import('@/pages/admin/AdminSecurity'));
const IntegrationsDebugPage = lazy(() => import('@/pages/admin/IntegrationsDebugPage'));
const DataAuditPage = lazy(() => import('@/pages/admin/DataAudit'));
const HublaWebhooks = lazy(() => import('@/pages/admin/HublaWebhooks'));
const AdminAutomations = lazy(() => import('@/pages/admin/AdminAutomations'));
const AutomationForm = lazy(() => import('@/pages/admin/AutomationForm'));
const AutomationLogs = lazy(() => import('@/pages/admin/AutomationLogs'));
const SolutionAccessOverrides = lazy(() => import('@/pages/admin/SolutionAccessOverrides'));
const StyleGuidePage = lazy(() => import('@/pages/StyleGuidePage'));
const AdminNetworking = lazy(() => import('@/pages/admin/AdminNetworking'));
const AdminBuilder = lazy(() => import('@/pages/admin/AdminBuilder'));
const NPSAnalytics = lazy(() => import('@/pages/admin/NPSAnalytics'));
const CertificateTemplates = lazy(() => import('@/pages/admin/CertificateTemplates'));
const CourseCertificateManager = lazy(() => import('@/pages/admin/CourseCertificateManager'));
const NotificationsStats = lazy(() => import('@/pages/admin/NotificationsStats'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));
const EmailDashboard = lazy(() => import('@/pages/admin/communications/EmailDashboard'));
const EmailLogs = lazy(() => import('@/pages/admin/communications/EmailLogs'));
const EmailSettings = lazy(() => import('@/pages/admin/communications/EmailSettings'));
const AdminBroadcast = lazy(() => import('@/pages/admin/AdminBroadcast'));
const PromptsManager = lazy(() => import('@/pages/admin/PromptsManager'));


// Função helper para criar rotas protegidas com AdminLayout e lazy loading
const createAdminRoute = (path: string, Component: React.LazyExoticComponent<React.ComponentType<any>>) => ({
  path,
  element: (
    <AdminProtectedRoutes>
      <AdminLayout>
        <Suspense fallback={<OptimizedLoadingScreen />}>
          <Component />
        </Suspense>
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
  createAdminRoute("/admin/mentorias", AdminEvents), // Alias para nova nomenclatura
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", InvitesManagement),
  createAdminRoute("/admin/invite-debug", InviteDebug),
  createAdminRoute("/admin/communications", AdminCommunications),
  createAdminRoute("/admin/communications/email-dashboard", EmailDashboard),
  createAdminRoute("/admin/communications/email-logs", EmailLogs),
  createAdminRoute("/admin/communications/email-settings", EmailSettings),
  createAdminRoute("/admin/security", AdminSecurity),
  createAdminRoute("/admin/whatsapp-debug", WhatsAppDebug),
  createAdminRoute("/admin/integrations-debug", IntegrationsDebugPage),
  createAdminRoute("/admin/diagnostics", SupabaseDiagnostics),
  
  createAdminRoute("/admin/nps", NPSAnalytics),
  createAdminRoute("/admin/certificate-templates", CertificateTemplates),
  createAdminRoute("/admin/course-certificates", CourseCertificateManager),
  createAdminRoute("/admin/notifications", AdminNotifications),
  createAdminRoute("/admin/notifications/stats", NotificationsStats),
  createAdminRoute("/admin/notifications/broadcast", AdminBroadcast),
  
  createAdminRoute("/admin/data-audit", DataAuditPage),
  createAdminRoute("/admin/hubla-webhooks", HublaWebhooks),
  createAdminRoute("/admin/automations", AdminAutomations),
  createAdminRoute("/admin/automations/new", AutomationForm),
  createAdminRoute("/admin/automations/logs", AutomationLogs),
  createAdminRoute("/admin/automations/:id", AutomationForm),
  createAdminRoute("/admin/style-guide", StyleGuidePage),
  createAdminRoute("/admin/networking", AdminNetworking),
  createAdminRoute("/admin/builder", AdminBuilder),
  createAdminRoute("/admin/prompts", PromptsManager),
];
