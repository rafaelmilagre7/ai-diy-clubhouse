
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  return (
    <div className="flex h-16 items-center justify-between px-4">
      {sidebarOpen ? (
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
            alt="VIVER DE IA Club" 
            className="h-8 w-auto" 
          />
        </Link>
      ) : (
        <Link to="/dashboard" className="mx-auto">
          <img 
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
            alt="VIVER DE IA Club" 
            className="h-8 w-auto" 
          />
        </Link>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="ml-auto"
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </Button>
    </div>
  );
};
