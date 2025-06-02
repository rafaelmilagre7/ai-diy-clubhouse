
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRAND_ASSETS } from "@/utils/storage/brandAssets";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-3">
      <div className="flex items-center overflow-hidden">
        <div className="relative transition-all duration-300 ease-in-out">
          {sidebarOpen ? (
            <img
              src={BRAND_ASSETS.horizontalLogo}
              alt="VIVER DE IA Club"
              className="h-8 w-auto transition-opacity duration-300"
              width={150}
              height={32}
              loading="eager"
              onError={(e) => {
                // Fallback para logo anterior se a imagem falhar
                e.currentTarget.src = "https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif";
              }}
            />
          ) : (
            <img
              src={BRAND_ASSETS.squareIcon}
              alt="VIVER DE IA"
              className="h-8 w-8 transition-opacity duration-300"
              width={32}
              height={32}
              loading="eager"
              onError={(e) => {
                // Fallback para logo anterior se a imagem falhar
                e.currentTarget.src = "https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif";
              }}
            />
          )}
        </div>
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
