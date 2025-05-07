
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  sidebarOpen: boolean;
  setSidebarOpen?: (open: boolean) => void;  // Tornando opcional para compatibilidade
}

export function SidebarLogo({ sidebarOpen, setSidebarOpen }: SidebarLogoProps) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        "flex items-center",
        !sidebarOpen && "justify-center"
      )}
    >
      {sidebarOpen ? (
        <img 
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
          alt="VIVER DE IA Club" 
          className="h-8 w-auto" 
        />
      ) : (
        <img 
          src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
          alt="VIVER DE IA Club" 
          className="h-8 w-auto" 
        />
      )}
    </Link>
  );
}
