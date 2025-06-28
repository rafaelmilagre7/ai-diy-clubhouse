
import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Navigate } from "react-router-dom";
import { useProductionLogger } from "@/hooks/useProductionLogger";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { log, error } = useProductionLogger({ component: 'AdminLayout' });

  useEffect(() => {
    if (!authLoading && !user) {
      log('Usuário não autenticado, redirecionando para login');
    } else if (!authLoading && user && !isAdmin) {
      log('Usuário sem permissão de admin, redirecionando para dashboard');
    }
  }, [authLoading, user, isAdmin, log]);

  if (authLoading) {
    return <LoadingScreen message="Verificando permissões..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] overflow-hidden">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />
      
      <AdminContent 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </AdminContent>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
