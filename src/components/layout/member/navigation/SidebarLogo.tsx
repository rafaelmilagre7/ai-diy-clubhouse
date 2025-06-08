
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-3">
      <div className="flex items-center overflow-hidden">
        {sidebarOpen ? (
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-8 w-auto transition-all duration-300"
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-foreground">V</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex shrink-0"
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
