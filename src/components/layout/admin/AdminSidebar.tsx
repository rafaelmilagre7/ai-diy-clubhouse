
import { cn } from "@/lib/utils";
import { AdminUserProfile } from "./AdminUserProfile";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { AdminSidebarLogo } from "./AdminSidebarLogo";
import { BaseSidebarProps } from "../BaseLayout";

export const AdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen
}: BaseSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
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
        <AdminSidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Perfil do usuário */}
        <div className="px-3 pb-4">
          <AdminUserProfile sidebarOpen={sidebarOpen} />
        </div>
        
        {/* Divisor visual */}
        <div className="my-1 px-3">
          <div className="h-px bg-border/30"></div>
        </div>

        {/* Navegação */}
        <div className="flex-1 overflow-y-auto">
          <AdminSidebarNav sidebarOpen={sidebarOpen} />
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border/30">
          {sidebarOpen ? (
            <div className="text-xs text-muted-foreground text-center">
              Painel Administrativo
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center">
              Admin
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
