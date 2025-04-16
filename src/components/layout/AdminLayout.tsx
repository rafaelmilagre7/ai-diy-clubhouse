
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminContent } from "./admin/AdminContent";
import { Navigate } from "react-router-dom";

const AdminLayout = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mostrar tela de carregamento enquanto verifica a sessão
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Se o usuário não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não for admin, redirecionar para dashboard de membro
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <AdminContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  );
};

export default AdminLayout;
