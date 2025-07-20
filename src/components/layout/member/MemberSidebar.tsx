
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
        "bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/90",
        "dark:bg-gradient-to-br dark:from-background/95 dark:via-background/90 dark:to-background/95",
        "border-r border-slate-700/50 dark:border-border/30 backdrop-blur-xl",
        "shadow-2xl shadow-slate-900/20 dark:shadow-black/20",
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
      <div className="flex flex-col h-full overflow-hidden relative">
        {/* Overlay gradiente para profundidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/5 via-transparent to-primary/5 pointer-events-none opacity-60" />
        
        {/* Área do logo com gradiente elegante */}
        <div className="relative bg-gradient-to-r from-viverblue/10 via-primary/8 to-viverblue/10 border-b border-slate-600/30 dark:border-border/20">
          <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Navegação com scroll suave */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70 transition-colors">
          <MemberSidebarNav sidebarOpen={sidebarOpen} />
        </div>

        {/* Footer da sidebar com design premium */}
        {sidebarOpen && (
          <div className="relative p-4 border-t border-slate-600/30 dark:border-border/20 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 dark:from-muted/20 dark:via-muted/10 dark:to-muted/20">
            <div className="text-xs text-slate-300 dark:text-muted-foreground text-center relative">
              <div className="mb-2 text-viverblue font-semibold tracking-wide">
                VIVER DE IA
              </div>
              <div className="text-slate-400 dark:text-muted-foreground/70 font-medium">
                Club Premium
              </div>
              <div className="mt-1 text-slate-500 dark:text-muted-foreground/50 text-[10px]">
                v2.0.0
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
