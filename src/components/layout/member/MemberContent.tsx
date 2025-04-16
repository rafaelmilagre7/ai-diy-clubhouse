
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MemberHeader } from "./MemberHeader";
import { Toaster } from "sonner";

interface MemberContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberContent = ({ sidebarOpen, setSidebarOpen }: MemberContentProps) => {
  return (
    <main
      className={cn(
        "flex-1 overflow-x-hidden bg-slate-50 transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-20"
      )}
    >
      <MemberHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Page content */}
      <div className="py-6 px-4 md:px-6">
        <Outlet />
      </div>
      
      <Toaster 
        position="top-right" 
        closeButton 
        richColors 
        expand={false}
        duration={4000}
      />
    </main>
  );
};
