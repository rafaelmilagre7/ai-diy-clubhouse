
import { Route } from "react-router-dom";
import { lazy } from "react";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";
import AdminLayout from "@/components/layout/AdminLayout";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminSolutionEdit = lazy(() => import("@/pages/admin/AdminSolutionEdit"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminToolEdit = lazy(() => import("@/pages/admin/AdminToolEdit"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));
const AdminSuggestionDetails = lazy(() => import("@/pages/admin/AdminSuggestionDetails"));
const SolutionEditor = lazy(() => import("@/pages/admin/SolutionEditor"));

export const AdminRoutes = () => {
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
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="tools" element={<AdminTools />} />
      <Route path="tools/new" element={<AdminToolEdit />} />
      <Route path="tools/:id" element={<AdminToolEdit />} />
      <Route path="suggestions" element={<AdminSuggestions />} />
      <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
    </Route>
  );
};
