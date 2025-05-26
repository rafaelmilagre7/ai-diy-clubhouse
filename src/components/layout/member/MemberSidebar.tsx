
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SystemHealthIndicator } from "@/components/common/SystemHealthIndicator";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Wrench,
  Gift,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle,
  GraduationCap,
  TrendingUp,
  BookOpen
} from "lucide-react";

interface MemberSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string | null;
  getInitials: (name: string | null) => string;
  signOut: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Trilha de Implementação",
    href: "/implementation-trail",
    icon: TrendingUp,
  },
  {
    name: "Soluções",
    href: "/solutions",
    icon: Lightbulb,
  },
  {
    name: "Aprendizado",
    href: "/learning",
    icon: BookOpen,
  },
  {
    name: "Comunidade",
    href: "/comunidade",
    icon: MessageCircle,
  },
  {
    name: "Ferramentas",
    href: "/tools",
    icon: Wrench,
  },
  {
    name: "Benefícios",
    href: "/benefits",
    icon: Gift,
  },
  {
    name: "Eventos",
    href: "/events",
    icon: Calendar,
  },
];

export const MemberSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut,
}: MemberSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <img
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
                alt="VDA"
                className="h-8 w-8 rounded"
              />
              <span className="font-bold text-lg">VDA Hub</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleMenuClick}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-viverblue text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* System Health Indicator */}
          <div className="px-4 py-2 border-t border-gray-700">
            <SystemHealthIndicator />
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <Avatar 
                className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-viverblue transition-all"
                onClick={handleProfileClick}
              >
                <AvatarImage src={profileAvatar || ""} />
                <AvatarFallback className="bg-viverblue text-white text-xs">
                  {getInitials(profileName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profileName || "Usuário"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profileEmail || ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-gray-700 p-1"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
