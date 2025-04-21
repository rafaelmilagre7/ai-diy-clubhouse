
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarLogo = ({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) => {
  const toggleSidebar = () => {
    console.log("Alternando sidebar de", sidebarOpen, "para", !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-16 items-center justify-between px-3">
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
          <div className="h-8 w-8 flex items-center justify-center bg-[#0ABAB5] rounded-full text-white font-bold">
            VI
          </div>
        </Link>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={sidebarOpen ? "ml-2" : "hidden md:flex mx-auto mt-2"}
        aria-label={sidebarOpen ? "Colapsar menu" : "Expandir menu"}
      >
        {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
      </Button>
    </div>
  );
};
