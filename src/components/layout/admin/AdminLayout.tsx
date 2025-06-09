
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  // Verificar se o usuário está autenticado e é admin
  useEffect(() => {
    setIsMounted(true);
    
    if (!user) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate("/auth/login");
      return;
    }

    const isAdmin = profile?.role === "admin";
    
    if (!isAdmin) {
      console.log("Usuário não é administrador, redirecionando para dashboard");
      toast.error("Você não tem permissão para acessar a área administrativa");
      navigate("/dashboard");
    }
  }, [user, profile, navigate]);

  // Renderização condicional enquanto verifica permissões
  if (!isMounted || !user) {
    return (
      <div className="flex min-h-screen bg-[#0F111A] text-white">
        <div className="w-64 bg-[#0F111A] border-r border-white/5 p-4 flex flex-col">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-white/10" />
            <Skeleton className="h-12 w-12 rounded-full bg-white/10 mx-auto" />
            <Skeleton className="h-4 w-24 bg-white/10 mx-auto" />
            
            <div className="h-px bg-white/5 my-4"></div>
            
            <div className="space-y-2">
              {Array(6).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-white/10" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-white/10" />
            <Skeleton className="h-64 w-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - sempre aberto com 264px de largura fixo */}
      <AdminSidebar />
      
      {/* Conteúdo principal - sempre com margin-left para compensar o sidebar fixo */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
