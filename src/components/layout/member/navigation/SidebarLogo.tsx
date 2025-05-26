
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  console.log("SidebarLogo renderizando, sidebarOpen:", sidebarOpen);
  
  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-3 border-b border-[#2A2E42]">
      {sidebarOpen ? (
        <div className="flex items-center min-w-0">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-8 w-auto max-w-[120px] object-contain"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="h-6 w-6 object-contain rounded"
          />
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex shrink-0 h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2A2E42]"
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
