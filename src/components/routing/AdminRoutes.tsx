
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Importação de páginas admin que serão implementadas posteriormente
const AdminSolutions = () => <div>Soluções (Em implementação)</div>;
const AdminTools = () => <div>Ferramentas (Em implementação)</div>;
const AdminSuggestions = () => <div>Sugestões (Em implementação)</div>;
const AdminUsers = () => <div>Usuários (Em implementação)</div>;
const AdminAnalytics = () => <div>Métricas (Em implementação)</div>;
const AdminSettings = () => <div>Configurações (Em implementação)</div>;

// Definir a interface para as props do componente
interface AdminRoutesProps {
  children?: ReactNode;
}

/**
 * AdminRoutes configura as rotas administrativas da aplicação
 */
const AdminRoutes = ({ children }: AdminRoutesProps) => {
  // Implementação das rotas de administrador
  return (
    <Routes>
      <Route path="/" element={<AdminLayout>{children}</AdminLayout>}>
        <Route index element={<AdminDashboard />} />
        <Route path="solutions" element={<AdminSolutions />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export { AdminRoutes };
