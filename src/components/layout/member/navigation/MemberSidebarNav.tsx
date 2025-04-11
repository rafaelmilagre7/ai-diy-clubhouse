
import { Link } from "react-router-dom";
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
  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-2">
      <Link
        to="/dashboard"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <Home size={20} className="text-viverblue" />
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
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <div className="h-2 w-2 rounded-full bg-revenue" />
        {sidebarOpen && <span>Aumento de Receita</span>}
      </Link>
      
      <Link
        to="/dashboard?category=operational"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <div className="h-2 w-2 rounded-full bg-operational" />
        {sidebarOpen && <span>Otimização Operacional</span>}
      </Link>
      
      <Link
        to="/dashboard?category=strategy"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <div className="h-2 w-2 rounded-full bg-strategy" />
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
        to="/profile"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <Award size={20} className="text-viverblue" />
        {sidebarOpen && <span>Conquistas</span>}
      </Link>
      
      <Link
        to="/profile"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <BookOpenCheck size={20} className="text-viverblue" />
        {sidebarOpen && <span>Meu Progresso</span>}
      </Link>
      
      <Link
        to="/dashboard?calendar=true"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <Calendar size={20} className="text-viverblue" />
        {sidebarOpen && <span>Calendário</span>}
      </Link>
      
      <Link
        to="/community"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
      >
        <Users size={20} className="text-viverblue" />
        {sidebarOpen && <span>Comunidade</span>}
      </Link>
    </nav>
  );
};
