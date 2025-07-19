
import { cn } from "@/lib/utils";
import { SidebarLogo } from "./navigation/SidebarLogo";
import { MemberSidebarNav } from "./MemberSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";

export const MemberSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen
}: BaseSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out backdrop-blur-sm",
        // Largura responsiva
        sidebarOpen ? "w-64" : "w-16",
        // Visibilidade mobile vs desktop
        "md:translate-x-0", // Desktop sempre visível
        // Mobile: mostrar/ocultar baseado no estado
        sidebarOpen 
          ? "translate-x-0" // Mobile: visível quando aberto
          : "-translate-x-full md:translate-x-0" // Mobile: oculto, Desktop: visível mas colapsado
      )}
      // Prevenir scroll quando sidebar mobile está aberto
      style={{
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Área do logo */}
        <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Divisor visual */}
        <div className="my-1 px-3">
          <div className="h-px bg-border"></div>
        </div>

        {/* Navegação */}
        <div className="flex-1 overflow-y-auto">
          <MemberSidebarNav sidebarOpen={sidebarOpen} />
        </div>
      </div>
    </aside>
  );
};
