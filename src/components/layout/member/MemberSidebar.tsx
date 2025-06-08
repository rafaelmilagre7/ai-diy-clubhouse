
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./navigation/SidebarLogo";
import { MemberSidebarNav } from "./MemberSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";

export const MemberSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen
}: BaseSidebarProps) => {
  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-[#0F111A] to-[#1A1D29] border-r border-white/5 shadow-2xl",
          sidebarOpen ? "w-64" : "w-[70px]",
          // Em desktops, sempre visível
          "md:translate-x-0",
          // Em mobile, mostrar apenas quando aberto
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Gradient overlay for modern effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Área do logo */}
            <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <div className="my-1 px-3">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Navegação */}
            <MemberSidebarNav sidebarOpen={sidebarOpen} />
          </div>
        </div>
      </aside>
    </>
  );
};
