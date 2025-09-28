import { Outlet } from "react-router-dom";
import { MasterSidebar } from "./MasterSidebar";
import { MasterContent } from "./MasterContent";
import { useSidebarControl } from "@/hooks/useSidebarControl";

interface MasterLayoutProps {
  children?: React.ReactNode;
}

const MasterLayout = ({ children }: MasterLayoutProps) => {
  const { sidebarOpen, setSidebarOpen } = useSidebarControl();

  return (
    <div className="flex min-h-screen w-full bg-background" data-master-area>
      {/* Overlay mobile */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      
      <MasterSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      <MasterContent 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children || <Outlet />}
      </MasterContent>
    </div>
  );
};

export default MasterLayout;