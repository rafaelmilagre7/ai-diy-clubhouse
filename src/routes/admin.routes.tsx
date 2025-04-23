
import { Fragment } from "react";
import { Route } from "react-router-dom";
import AdminLayout from "@/components/layout/admin/AdminLayout";

// Páginas de administração
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSolutions from "@/pages/admin/AdminSolutions";
import AdminSolutionCreate from "@/pages/admin/AdminSolutionCreate";
import AdminSolutionEdit from "@/pages/admin/AdminSolutionEdit";
import SolutionEditor from "@/pages/admin/SolutionEditor";
import AdminSolutionRedirect from "@/components/routing/AdminSolutionRedirect";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTools from "@/pages/admin/AdminTools";

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
    <Route path="admin/solutions/:id/editor" element={
      <AdminLayout>
        <SolutionEditor />
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
