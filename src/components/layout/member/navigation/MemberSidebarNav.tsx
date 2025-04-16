
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Award, 
  BookOpenCheck, 
  Calendar, 
  Users
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: MemberSidebarNavProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-2">
      <Link
        to="/dashboard"
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
          isActive("/dashboard")
            ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
            : "text-gray-900 hover:bg-gray-100"
        )}
      >
        <Home size={20} className={cn(
          isActive("/dashboard") ? "text-[#0ABAB5]" : "text-viverblue"
        )} />
        {sidebarOpen && <span>Dashboard</span>}
      </Link>
      
      <div className={cn("mt-3 mb-2", sidebarOpen ? "px-3" : "text-center")}>
        {sidebarOpen ? (
          <span className="text-xs font-semibold uppercase text-gray-500">Trilhas</span>
        ) : (
          <Separator />
        )}
      </div>
      
      <Link
        to="/dashboard?category=revenue"
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
          location.search.includes("category=revenue")
            ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
            : "text-gray-900 hover:bg-gray-100"
        )}
      >
        <div className="h-2 w-2 rounded-full bg-green-500" />
        {sidebarOpen && <span>Aumento de Receita</span>}
      </Link>
      
      <Link
        to="/dashboard?category=operational"
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
          location.search.includes("category=operational")
            ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
            : "text-gray-900 hover:bg-gray-100"
        )}
      >
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
        {sidebarOpen && <span>Otimização Operacional</span>}
      </Link>
      
      <Link
        to="/dashboard?category=strategy"
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
          location.search.includes("category=strategy")
            ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
            : "text-gray-900 hover:bg-gray-100"
        )}
      >
        <div className="h-2 w-2 rounded-full bg-purple-500" />
        {sidebarOpen && <span>Gestão Estratégica</span>}
      </Link>
      
      <div className={cn("mt-3 mb-2", sidebarOpen ? "px-3" : "text-center")}>
        {sidebarOpen ? (
          <span className="text-xs font-semibold uppercase text-gray-500">Acompanhamento</span>
        ) : (
          <Separator />
        )}
      </div>
      
      <Link
        to="/dashboard/profile"
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
          isActive("/dashboard/profile")
            ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
            : "text-gray-900 hover:bg-gray-100"
        )}
      >
        <Award size={20} className={cn(
          isActive("/dashboard/profile") ? "text-[#0ABAB5]" : "text-viverblue"
        )} />
        {sidebarOpen && <span>Conquistas</span>}
      </Link>
      
      <Link
        to="/dashboard/profile"
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors",
          false
            ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
            : "text-gray-900 hover:bg-gray-100"
        )}
      >
        <BookOpenCheck size={20} className="text-viverblue" />
        {sidebarOpen && <span>Meu Progresso</span>}
      </Link>
    </nav>
  );
};
