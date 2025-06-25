
import { RouteObject } from "react-router-dom";
import { UnifiedProtectedRoutes } from '@/auth/UnifiedProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import SolutionsList from '@/pages/admin/SolutionsList';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminTools from '@/pages/admin/AdminTools';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminInvites from '@/pages/admin/AdminInvites';
import AdminCourses from '@/pages/admin/AdminCourses';
import CourseEditor from '@/pages/admin/CourseEditor';
import LessonEditor from '@/pages/admin/LessonEditor';
import AdminBenefits from '@/pages/admin/AdminBenefits';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminCommunications from '@/pages/admin/AdminCommunications';
import AdminSecurity from '@/pages/admin/AdminSecurity';

// Função helper para criar rotas protegidas de admin
const createAdminRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <UnifiedProtectedRoutes requireAdmin><AdminLayout><Component /></AdminLayout></UnifiedProtectedRoutes>
});

export const adminRoutes: RouteObject[] = [
  createAdminRoute("/admin", AdminDashboard),
  createAdminRoute("/admin/dashboard", AdminDashboard),
  
  // Solutions
  createAdminRoute("/admin/solutions", SolutionsList),
  createAdminRoute("/admin/solutions/new", SolutionEditor),
  createAdminRoute("/admin/solutions/:id", SolutionEditor),
  
  // Tools
  createAdminRoute("/admin/tools", AdminTools),
  
  // Users & Roles
  createAdminRoute("/admin/users", AdminUsers),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/invites", AdminInvites),
  
  // LMS
  createAdminRoute("/admin/courses", AdminCourses),
  createAdminRoute("/admin/courses/new", CourseEditor),
  createAdminRoute("/admin/courses/:id", CourseEditor),
  createAdminRoute("/admin/courses/:courseId/lessons/new", LessonEditor),
  createAdminRoute("/admin/courses/:courseId/lessons/:lessonId", LessonEditor),
  
  // Benefits & Events
  createAdminRoute("/admin/benefits", AdminBenefits),
  createAdminRoute("/admin/events", AdminEvents),
  
  // Analytics & Communications
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/communications", AdminCommunications),
  
  // Security
  createAdminRoute("/admin/security", AdminSecurity),
];
