
import { Route, Routes } from "react-router-dom";
import { lazy, ReactNode } from "react";
import AdminLayout from "@/components/layout/AdminLayout";

// Lazy loading das páginas
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminSolutionEdit = lazy(() => import("@/pages/admin/AdminSolutionEdit"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminToolEdit = lazy(() => import("@/pages/admin/AdminToolEdit"));
const AdminSuggestions = lazy(() => import("@/pages/admin/Suggestions"));
const AdminSuggestionDetails = lazy(() => import("@/pages/admin/AdminSuggestionDetails"));
const SolutionEditor = lazy(() => import("@/pages/admin/SolutionEditor"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));

interface AdminRoutesProps {
  children?: ReactNode;
}

export const AdminRoutes = ({ children }: AdminRoutesProps) => {
  return (
    <Routes>
      <Route element={<AdminLayout>{children}</AdminLayout>}>
        <Route index element={<AdminDashboard />} />
        <Route path="solutions" element={<AdminSolutions />} />
        <Route path="solutions/new" element={<AdminSolutionEdit />} />
        <Route path="solutions/:id" element={<AdminSolutionEdit />} />
        <Route path="solutions/:id/editor" element={<SolutionEditor />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="tools/new" element={<AdminToolEdit />} />
        <Route path="tools/:id" element={<AdminToolEdit />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
