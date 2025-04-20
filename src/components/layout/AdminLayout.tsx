
import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminContent } from "./admin/AdminContent";

interface AdminLayoutProps {
  children?: ReactNode;
}

/**
 * AdminLayout renders the layout structure for admin users
 * This includes the sidebar and content area
 */
const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { profile, isAdmin, user } = useAuth();
  const location = useLocation();
  
  // Se não for admin e tiver usuário, redireciona para o dashboard
  // Mas não redireciona se estiver em uma URL de sugestão específica
  if (!isAdmin && user) {
    console.log("Não é admin, redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Default to showing sidebar on desktop, hiding on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Handle window resize to auto-adjust sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Garantir que o documento está sempre clicável
  useEffect(() => {
    // Restaurar pointer-events quando o componente montar
    document.body.style.pointerEvents = 'auto';
    
    return () => {
      // Garantir que está restaurado ao desmontar
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />
      <AdminContent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      >
        {children || <Outlet />}
      </AdminContent>
    </div>
  );
};

export default AdminLayout;
