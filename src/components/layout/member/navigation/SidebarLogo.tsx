
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  // Log para verificar quando o componente é renderizado
  console.log("SidebarLogo renderizando, sidebarOpen:", sidebarOpen);
  
  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-3">
      <div className="flex items-center">
        <img
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
          alt="VIVER DE IA Club"
          className="h-8 w-auto"
        />
        {sidebarOpen && (
          <span className="ml-2 text-lg font-semibold">VIVER DE IA</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
