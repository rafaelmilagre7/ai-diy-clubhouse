
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminContent } from "./admin/AdminContent";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/supabase";

const AdminLayout = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Verificar user role quando o componente é montado e quando profile muda
  useEffect(() => {
    if (!profile) {
      console.log("AdminLayout useEffect: Ainda não há perfil de usuário carregado");
      return;
    }
    
    if (profile.role !== 'admin') {
      console.log("AdminLayout useEffect: Usuário não é admin, redirecionando para /dashboard", { 
        profileRole: profile.role
      });
      
      // Notificar o usuário do redirecionamento
      toast({
        title: "Acesso restrito",
        description: "Esta área é apenas para administradores. Você está sendo redirecionado para a área de membros."
      });
      
      navigate('/dashboard', { replace: true });
    } else {
      console.log("AdminLayout useEffect: Confirmando que o usuário é admin", {
        profileRole: profile.role
      });
    }
  }, [profile, navigate]);

  // Mostrar tela de carregamento enquanto verifica a sessão
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se o usuário não estiver autenticado, redirecionar para login
  if (!user) {
    console.log("AdminLayout render: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não for admin, redirecionar para dashboard de membro
  if (!isAdmin) {
    console.log("AdminLayout render: Usuário não é admin, redirecionando para /dashboard", {
      profileRole: profile?.role,
      isAdmin
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  // Verificação final do papel do usuário
  if (profile && profile.role !== 'admin') {
    console.log("AdminLayout render: Papel do usuário não é admin, mas é:", {
      papel_atual: profile.role
    });
    
    // Esta linha não altera o banco de dados, apenas a exibição atual
    // Ideal seria ter uma atualização completa no banco via supabase.from('profiles').update
  }

  console.log("AdminLayout render: Usuário é admin, permanecendo na área admin", {
    profileRole: profile?.role,
    isAdmin
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <AdminContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  );
};

export default AdminLayout;
