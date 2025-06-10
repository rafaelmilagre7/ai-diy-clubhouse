
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface AdminSidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebarLogo = ({ sidebarOpen, setSidebarOpen }: AdminSidebarLogoProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-3">
      <div className="flex items-center overflow-hidden min-w-0">
        <img
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
          alt="VIVER DE IA Club"
          className={cn(
            "transition-all duration-300 object-contain",
            sidebarOpen 
              ? "h-8 w-auto max-w-[160px]" // Logo completo quando aberto
              : "h-8 w-8" // Logo compacto quando fechado
          )}
        />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "shrink-0 text-white/70 hover:text-white hover:bg-white/10",
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
