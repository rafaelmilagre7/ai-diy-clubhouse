
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Award, 
  BookOpenCheck, 
  Calendar, 
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MemberSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
}

export const MemberSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}: MemberSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo area */}
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
      
      <Separator />

      {/* Navigation */}
      <MemberSidebarNav sidebarOpen={sidebarOpen} />

      {/* User menu at bottom of sidebar */}
      <MemberSidebarFooter 
        sidebarOpen={sidebarOpen} 
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
      />
    </aside>
  );
};

// Navigation component
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

// Footer with user menu
interface MemberSidebarFooterProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
}

export const MemberSidebarFooter = ({ 
  sidebarOpen, 
  profileName, 
  profileEmail, 
  profileAvatar,
  getInitials 
}: MemberSidebarFooterProps) => {
  return (
    <>
      <Separator />
      <MemberUserMenu 
        sidebarOpen={sidebarOpen} 
        profileName={profileName}
        profileEmail={profileEmail}
        profileAvatar={profileAvatar}
        getInitials={getInitials}
      />
    </>
  );
};
