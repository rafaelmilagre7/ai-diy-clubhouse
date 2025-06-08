
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
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-[#0F111A] border-r border-white/5 transition-transform duration-300 ease-in-out",
          "w-64", // Largura fixa
          // Desktop: sempre visível, mobile: controlado por sidebarOpen
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Área do logo */}
          <SidebarLogo sidebarOpen={true} setSidebarOpen={setSidebarOpen} />
          
          <div className="my-1 px-3">
            <div className="h-px bg-white/5"></div>
          </div>

          {/* Navegação */}
          <MemberSidebarNav sidebarOpen={true} />
        </div>
      </aside>
    </>
  );
};
