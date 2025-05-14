
import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  Settings,
  BookOpen,
  CalendarDays,
  Mail,
  LogOut,
  Boxes,
  MessageSquare,
  Lightbulb,
  UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminLayout = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  // Verificar se o usuário está autenticado e é admin
  useEffect(() => {
    setIsMounted(true);
    
    if (!user) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate("/auth/login");
      return;
    }

    const isAdmin = profile?.role === "admin";
    
    if (!isAdmin) {
      console.log("Usuário não é administrador, redirecionando para dashboard");
      toast.error("Você não tem permissão para acessar a área administrativa");
      navigate("/dashboard");
    }
  }, [user, profile, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  // Lista de links da navegação
  const navItems = [
    { 
      to: "/admin", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: "Dashboard",
      isExact: true
    },
    { 
      to: "/admin/solutions", 
      icon: <Boxes className="h-5 w-5" />, 
      label: "Soluções" 
    },
    { 
      to: "/admin/courses", 
      icon: <BookOpen className="h-5 w-5" />, 
      label: "Cursos" 
    },
    { 
      to: "/admin/users", 
      icon: <Users className="h-5 w-5" />, 
      label: "Usuários" 
    },
    { 
      to: "/admin/invites", 
      icon: <Mail className="h-5 w-5" />, 
      label: "Convites" 
    },
    { 
      to: "/admin/events", 
      icon: <CalendarDays className="h-5 w-5" />, 
      label: "Eventos" 
    },
    { 
      to: "/admin/roles", 
      icon: <UserCog className="h-5 w-5" />, 
      label: "Perfis" 
    },
    { 
      to: "/admin/suggestions", 
      icon: <Lightbulb className="h-5 w-5" />, 
      label: "Sugestões" 
    },
    { 
      to: "/admin/onboarding", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Onboarding" 
    },
    { 
      to: "/admin/config", 
      icon: <Settings className="h-5 w-5" />, 
      label: "Configurações" 
    }
  ];

  // Renderização condicional enquanto verifica permissões
  if (!isMounted || !user) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <div className="w-64 bg-gray-800 p-4 flex flex-col">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-gray-700" />
            <Skeleton className="h-12 w-12 rounded-full bg-gray-700 mx-auto" />
            <Skeleton className="h-4 w-24 bg-gray-700 mx-auto" />
            
            <Separator className="my-4 bg-gray-700" />
            
            <div className="space-y-2">
              {Array(6).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-gray-700" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-gray-800" />
            <Skeleton className="h-64 w-full bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-12 w-12 border border-primary">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || ""}/>
              <AvatarFallback className="bg-primary text-sm">
                {profile?.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <p className="mt-2 font-medium text-sm">{profile?.name}</p>
            <p className="text-xs text-gray-400">{profile?.email}</p>
          </div>
          
          <Separator className="my-4" />
          
          <ScrollArea className="flex-1 px-1" style={{ height: "calc(100vh - 240px)" }}>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.isExact}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
