
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-4 py-3">
      <div className={cn(
        "flex items-center overflow-hidden min-w-0",
        "transition-all duration-300 ease-in-out"
      )}>
        <div className={cn(
          "relative overflow-hidden rounded-lg",
          "bg-gradient-to-br from-primary/10 to-primary/20",
          "p-1",
          sidebarOpen ? "w-auto" : "w-8 h-8 flex items-center justify-center"
        )}>
          <img
            src="/lovable-uploads/21d33edc-743c-46f1-8095-e87992a2b3a4.png"
            alt="VIVER DE IA Club"
            className={cn(
              "transition-all duration-300 object-contain",
              sidebarOpen 
                ? "h-10 w-auto max-w-[180px]" // Logo completo quando aberto
                : "h-8 w-8 object-cover" // Logo compacto quando fechado
            )}
            onError={(e) => {
              // Fallback: mostrar texto se a imagem não carregar
              const target = e.currentTarget;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `
                  <div class="flex items-center justify-center h-full w-full bg-primary/20 rounded text-primary font-bold text-sm">
                    ${sidebarOpen ? 'VIVER DE IA' : 'VIA'}
                  </div>
                `;
              }
            }}
          />
        </div>
        
        {sidebarOpen && (
          <div className="ml-3 min-w-0 animate-fade-in">
            <h1 className="font-bold text-sm text-foreground truncate">
              VIVER DE IA
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Club Premium
            </p>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "shrink-0 h-8 w-8",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-primary/10 hover:scale-105",
          "transition-all duration-200",
          "focus-visible:ring-2 focus-visible:ring-primary/20",
          // Mostrar diferentes ícones baseado no contexto
          isMobile ? "md:hidden" : "hidden md:flex"
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMobile ? (
          // Mobile: X para fechar, Menu para abrir
          sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />
        ) : (
          // Desktop: setas para colapsar/expandir
          sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
