
import { Fragment } from "react";
import { Route } from "react-router-dom";
import AdminLayout from "@/components/layout/admin/AdminLayout";

// Páginas de administração
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSolutions from "@/pages/admin/AdminSolutions";
import AdminTools from "@/pages/admin/AdminTools";
import AdminSuggestions from "@/pages/admin/AdminSuggestions";
import AdminOnboarding from "@/pages/admin/AdminOnboarding";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSolutionCreate from "@/pages/admin/AdminSolutionCreate";
import AdminSolutionEdit from "@/pages/admin/AdminSolutionEdit";
import SolutionEditor from "@/pages/admin/SolutionEditor";
import AdminToolEdit from "@/pages/admin/AdminToolEdit";
import AdminSuggestionDetails from "@/pages/admin/AdminSuggestionDetails";
import AdminImplementationProfiles from "@/pages/admin/AdminImplementationProfiles";

export const adminRoutes = (
  <Fragment>
    {/* Dashboard */}
    <Route path="admin" element={
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    } />
    
    {/* Usuários */}
    <Route path="admin/users" element={
      <AdminLayout>
        <AdminUsers />
      </AdminLayout>
    } />
    
    {/* Perfis de Implementação */}
    <Route path="admin/implementation-profiles" element={
      <AdminLayout>
        <AdminImplementationProfiles />
      </AdminLayout>
    } />
    
    {/* Soluções */}
    <Route path="admin/solutions" element={
      <AdminLayout>
        <AdminSolutions />
      </AdminLayout>
    } />
    <Route path="admin/solutions/new" element={
      <AdminLayout>
        <AdminSolutionCreate />
      </AdminLayout>
    } />
    <Route path="admin/solutions/:id" element={
      <AdminLayout>
        <AdminSolutionEdit />
      </AdminLayout>
    } />
    <Route path="admin/solutions/:id/editor" element={
      <AdminLayout>
        <SolutionEditor />
      </AdminLayout>
    } />
    
    {/* Ferramentas */}
    <Route path="admin/tools" element={
      <AdminLayout>
        <AdminTools />
      </AdminLayout>
    } />
    <Route path="admin/tools/new" element={
      <AdminLayout>
        <AdminToolEdit />
      </AdminLayout>
    } />
    <Route path="admin/tools/:id" element={
      <AdminLayout>
        <AdminToolEdit />
      </AdminLayout>
    } />
    
    {/* Sugestões */}
    <Route path="admin/suggestions" element={
      <AdminLayout>
        <AdminSuggestions />
      </AdminLayout>
    } />
    <Route path="admin/suggestions/:id" element={
      <AdminLayout>
        <AdminSuggestionDetails />
      </AdminLayout>
    } />
    
    {/* Onboarding e Analytics */}
    <Route path="admin/onboarding" element={
      <AdminLayout>
        <AdminOnboarding />
      </AdminLayout>
    } />
    <Route path="admin/analytics" element={
      <AdminLayout>
        <AdminAnalytics />
      </AdminLayout>
    } />
  </Fragment>
);
