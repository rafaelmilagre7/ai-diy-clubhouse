
import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { Link } from "react-router-dom";
import { ConnectionNotificationsDropdown } from "@/components/community/notifications/ConnectionNotificationsDropdown";

interface MemberHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberHeader = ({ sidebarOpen, setSidebarOpen }: MemberHeaderProps) => {
  const { profile } = useAuth();
  const [scrollPosition, setScrollPosition] = useState(0);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 bg-[#0F111A] ${
      scrollPosition > 10 ? "border-b border-neutral-800 shadow-sm" : ""
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Menu mobile */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </div>
          
          {/* Logo (somente desktop) */}
          <div className="hidden md:flex md:items-center">
            <Link to="/" className="font-bold text-lg text-white">
              VIVER DE IA
            </Link>
          </div>

          {/* Ações da direita */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
              asChild
            >
              <Link to="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Link>
            </Button>

            <ConnectionNotificationsDropdown />

            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
              asChild
            >
              <Link to="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configurações</span>
              </Link>
            </Button>

            <Link to="/profile">
              <Avatar className="h-8 w-8 border border-neutral-700">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile?.name || "Perfil"} />
                ) : null}
                <AvatarFallback className="bg-neutral-800 text-white">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
