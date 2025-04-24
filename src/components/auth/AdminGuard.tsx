
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";

const AdminGuard = () => {
  const { isAdmin } = useAuth();
  
  // Verificar se o usuário é administrador
  if (!isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se for admin, aplicar layout administrativo
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminGuard;
