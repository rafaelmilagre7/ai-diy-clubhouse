
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
      <img
        src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
        alt="VIVER DE IA Club"
        className={cn(
          "transition-all duration-300 object-contain",
          sidebarOpen 
            ? "h-12 w-auto max-w-[200px]" // Logo maior quando aberto
            : "h-10 w-10 object-cover" // Logo compacto quando fechado
        )}
      />
      
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
