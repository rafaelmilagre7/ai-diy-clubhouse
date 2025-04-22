
import { Route } from "react-router-dom";
import { lazy } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminSolutionEdit = lazy(() => import("@/pages/admin/AdminSolutionEdit"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminToolEdit = lazy(() => import("@/pages/admin/AdminToolEdit"));
const AdminSuggestions = lazy(() => import("@/pages/admin/Suggestions"));
const AdminSuggestionDetails = lazy(() => import("@/pages/admin/AdminSuggestionDetails"));
const SolutionEditor = lazy(() => import("@/pages/admin/SolutionEditor"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));

/**
 * Este componente não é mais usado.
 * As rotas administrativas estão em src/components/routing/AdminRoutes.tsx
 */
export const AdminRoutes = () => {
  console.log("DEPRECADO: Este arquivo de rotas não deve ser usado");
  
  return (
    <Route
      path="/admin"
      element={
        <AdminProtectedRoutes>
          <AdminLayout />
        </AdminProtectedRoutes>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="solutions" element={<AdminSolutions />} />
      <Route path="solutions/new" element={<AdminSolutionEdit />} />
      <Route path="solutions/:id" element={<AdminSolutionEdit />} />
      <Route path="solutions/:id/editor" element={<SolutionEditor />} />
      <Route path="tools" element={<AdminTools />} />
      <Route path="tools/new" element={<AdminToolEdit />} />
      <Route path="tools/:id" element={<AdminToolEdit />} />
      <Route path="suggestions" element={<AdminSuggestions />} />
      <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
      <Route path="users" element={<UserManagement />} />
    </Route>
  );
};
