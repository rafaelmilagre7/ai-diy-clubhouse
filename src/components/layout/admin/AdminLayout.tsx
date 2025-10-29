import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminContent } from "./AdminContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { ScrollToTop } from "@/components/routing/ScrollToTop";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useSidebarControl();

  useEffect(() => {
    console.log("🔄 [ADMIN-LAYOUT] Rota mudou:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background dark" data-admin-area>
      <ScrollToTop />
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
        <div key={location.pathname}>
          {children || <Outlet />}
        </div>
      </AdminContent>
    </div>
  );
};

export default AdminLayout;
