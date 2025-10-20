
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { sidebarOpen, setSidebarOpen } = useSidebarControl();

  // AdminProtectedRoutes já garante que apenas admins chegam aqui
  // Removi toda a lógica complexa de verificação
  return (
    <div className="flex min-h-screen w-full bg-background dark" data-admin-area>
      {/* Overlay mobile */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      
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
