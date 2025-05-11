
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";
import { FormacaoProtectedRoutes } from "@/auth/FormacaoProtectedRoutes";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import LoadingScreen from "@/components/common/LoadingScreen";

// Carregamento dinâmico de páginas
const Dashboard = lazy(() => import("@/pages/dashboard/DashboardPage"));
const Login = lazy(() => import("@/pages/auth/LoginPage"));
const Register = lazy(() => import("@/pages/auth/RegisterPage"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const NotFound = lazy(() => import("@/pages/not-found/NotFoundPage"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminSolutions = lazy(() => import("@/pages/admin/SolutionsPage"));
const AdminUsers = lazy(() => import("@/pages/admin/UsersPage"));
const AdminTools = lazy(() => import("@/pages/admin/ToolsPage"));
const AdminSuggestions = lazy(() => import("@/pages/admin/SuggestionsPage"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AnalyticsPage"));
const AdminEvents = lazy(() => import("@/pages/admin/EventsPage"));
const AdminOnboarding = lazy(() => import("@/pages/admin/OnboardingPage"));

// Novas páginas de administração de papéis
const AdminRoles = lazy(() => import("@/pages/admin/RolesPage"));
const AdminPermissions = lazy(() => import("@/pages/admin/PermissionAuditLogPage"));

// Formação pages
const LmsHome = lazy(() => import("@/pages/formacao/HomePage"));
const LmsCourses = lazy(() => import("@/pages/formacao/CoursesPage"));
const LmsLessons = lazy(() => import("@/pages/formacao/LessonsPage"));
const LmsStudents = lazy(() => import("@/pages/formacao/StudentsPage"));

// Criar um componente de suspense reutilizável
const SuspensedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<SuspensedPage><Login /></SuspensedPage>} />
      <Route path="/register" element={<SuspensedPage><Register /></SuspensedPage>} />
      <Route path="/reset-password" element={<SuspensedPage><ResetPassword /></SuspensedPage>} />
      
      {/* Rotas protegidas */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<SuspensedPage><Dashboard /></SuspensedPage>} />
      </Route>

      {/* Rotas de Admin */}
      <Route element={<AdminProtectedRoutes />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<SuspensedPage><AdminDashboard /></SuspensedPage>} />
          <Route path="solutions" element={<SuspensedPage><AdminSolutions /></SuspensedPage>} />
          <Route path="users" element={<SuspensedPage><AdminUsers /></SuspensedPage>} />
          <Route path="tools" element={<SuspensedPage><AdminTools /></SuspensedPage>} />
          <Route path="suggestions" element={<SuspensedPage><AdminSuggestions /></SuspensedPage>} />
          <Route path="analytics" element={<SuspensedPage><AdminAnalytics /></SuspensedPage>} />
          <Route path="events" element={<SuspensedPage><AdminEvents /></SuspensedPage>} />
          <Route path="onboarding" element={<SuspensedPage><AdminOnboarding /></SuspensedPage>} />
          <Route path="roles" element={<SuspensedPage><AdminRoles /></SuspensedPage>} />
          <Route path="permissions/audit" element={<SuspensedPage><AdminPermissions /></SuspensedPage>} />
        </Route>
      </Route>
      
      {/* Rotas de Formação */}
      <Route element={<FormacaoProtectedRoutes />}>
        <Route path="/formacao" element={<AdminLayout />}>
          <Route index element={<SuspensedPage><LmsHome /></SuspensedPage>} />
          <Route path="cursos" element={<SuspensedPage><LmsCourses /></SuspensedPage>} />
          <Route path="aulas" element={<SuspensedPage><LmsLessons /></SuspensedPage>} />
          <Route path="alunos" element={<SuspensedPage><LmsStudents /></SuspensedPage>} />
        </Route>
      </Route>

      {/* Rota de página não encontrada */}
      <Route path="*" element={<SuspensedPage><NotFound /></SuspensedPage>} />
    </Routes>
  );
};

export default AppRoutes;
