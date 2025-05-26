
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  console.log("SidebarLogo renderizando, sidebarOpen:", sidebarOpen);
  
  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-3">
      {sidebarOpen ? (
        <div className="flex items-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-8 w-auto object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-6 w-6 object-contain"
          />
        </div>
      )}
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
