import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
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
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
          </div>
        }>
          {children || <Outlet />}
        </Suspense>
      </MasterContent>
    </div>
  );
};

export default MasterLayout;