
import { Fragment } from "react";
import { Route } from "react-router-dom";
import AdminLayout from "@/components/layout/admin/AdminLayout";

// Páginas de administração
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSolutions from "@/pages/admin/AdminSolutions";
import AdminSolutionCreate from "@/pages/admin/AdminSolutionCreate";
import AdminSolutionEdit from "@/pages/admin/AdminSolutionEdit";
import AdminSolutionRedirect from "@/components/routing/AdminSolutionRedirect";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTools from "@/pages/admin/AdminTools";
import AdminImplementationProfiles from "@/pages/admin/AdminImplementationProfiles";
import AdminImplementationProfileDetails from "@/pages/admin/AdminImplementationProfileDetails";
import AdminSuggestions from "@/pages/admin/AdminSuggestions";
import AdminSuggestionDetails from "@/pages/admin/AdminSuggestionDetails";

export const adminRoutes = (
  <Fragment>
    {/* Dashboard Admin */}
    <Route path="admin" element={
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    } />
    
    {/* Gerenciamento de Usuários */}
    <Route path="admin/users" element={
      <AdminLayout>
        <AdminUsers />
      </AdminLayout>
    } />
    
    {/* Gerenciamento de Ferramentas */}
    <Route path="admin/tools" element={
      <AdminLayout>
        <AdminTools />
      </AdminLayout>
    } />
    
    {/* Perfis de Implementação */}
    <Route path="admin/implementation-profiles" element={
      <AdminLayout>
        <AdminImplementationProfiles />
      </AdminLayout>
    } />
    <Route path="admin/implementation-profiles/:id" element={
      <AdminLayout>
        <AdminImplementationProfileDetails />
      </AdminLayout>
    } />
    
    {/* Gerenciamento de Sugestões */}
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
    
    {/* Gerenciamento de Soluções */}
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
    
    {/* Redirecionamento para URLs antigas */}
    <Route path="admin/solution/:id" element={
      <AdminSolutionRedirect />
    } />
    <Route path="admin/solution/:id/editor" element={
      <AdminSolutionRedirect />
    } />
  </Fragment>
);
