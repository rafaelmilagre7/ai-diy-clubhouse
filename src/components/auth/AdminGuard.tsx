
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import AdminLayout from "@/components/layout/AdminLayout";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

/**
 * AdminGuard - Protege rotas administrativas
 * Verifica se o usuário é administrador antes de permitir acesso
 */
const AdminGuard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Debug log
  console.log("AdminGuard:", { user: !!user, isAdmin, isLoading });
  
  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return <LoadingScreen message="Verificando permissões administrativas..." />;
  }
  
  // Se não for admin, redirecionar para dashboard
  if (!isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Aplicar o layout para administradores
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminGuard;
