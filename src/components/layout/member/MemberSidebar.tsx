
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
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-background via-background to-background/95",
        "border-r border-border/50 backdrop-blur-xl",
        "shadow-xl shadow-black/5",
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
        {/* Área do logo com gradiente sutil */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/30">
          <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Navegação com scroll suave */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <MemberSidebarNav sidebarOpen={sidebarOpen} />
        </div>

        {/* Footer da sidebar */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border/30 bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-medium">VIVER DE IA Club</p>
              <p className="mt-1 opacity-70">v2.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
