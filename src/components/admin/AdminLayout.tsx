
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
  UserCog,
  Wrench,
  BarChart3,
  Shield,
  UserPlus,
  TrendingUp,
  MessageCircle,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
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

  // Lista de links da navegação - agora com todos os itens
  const navItems = [
    { 
      to: "/admin", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: "Dashboard",
      isExact: true
    },
    { 
      to: "/admin/users", 
      icon: <Users className="h-5 w-5" />, 
      label: "Usuários" 
    },
    { 
      to: "/admin/communications", 
      icon: <Megaphone className="h-5 w-5" />, 
      label: "Comunicações" 
    },
    { 
      to: "/admin/tools", 
      icon: <Wrench className="h-5 w-5" />, 
      label: "Ferramentas" 
    },
    { 
      to: "/admin/solutions", 
      icon: <Lightbulb className="h-5 w-5" />, 
      label: "Soluções" 
    },
    { 
      to: "/admin/analytics", 
      icon: <BarChart3 className="h-5 w-5" />, 
      label: "Analytics" 
    },
    { 
      to: "/admin/suggestions", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Sugestões" 
    },
    { 
      to: "/admin/events", 
      icon: <CalendarDays className="h-5 w-5" />, 
      label: "Eventos" 
    },
    { 
      to: "/admin/roles", 
      icon: <Shield className="h-5 w-5" />, 
      label: "Papéis" 
    },
    { 
      to: "/admin/invites", 
      icon: <UserPlus className="h-5 w-5" />, 
      label: "Convites" 
    },
    { 
      to: "/admin/benefits", 
      icon: <TrendingUp className="h-5 w-5" />, 
      label: "Benefícios" 
    },
    { 
      to: "/admin/whatsapp-debug", 
      icon: <MessageCircle className="h-5 w-5" />, 
      label: "WhatsApp Debug" 
    }
  ];

  // Renderização condicional enquanto verifica permissões
  if (!isMounted || !user) {
    return (
      <div className="flex min-h-screen bg-[#0F111A] text-white">
        <div className="w-64 bg-[#0F111A] border-r border-white/5 p-4 flex flex-col">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-white/10" />
            <Skeleton className="h-12 w-12 rounded-full bg-white/10 mx-auto" />
            <Skeleton className="h-4 w-24 bg-white/10 mx-auto" />
            
            <Separator className="my-4 bg-white/5" />
            
            <div className="space-y-2">
              {Array(6).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-white/10" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 bg-white/10" />
            <Skeleton className="h-64 w-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - sempre aberto com 264px de largura fixo */}
      <div className="w-64 bg-[#0F111A] border-r border-white/5 flex flex-col">
        <div className="p-4">
          {/* Logo/Header */}
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          
          {/* Perfil do usuário */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-12 w-12 border border-primary">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || ""}/>
              <AvatarFallback className="bg-primary text-sm">
                {profile?.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <p className="mt-2 font-medium text-sm text-white">{profile?.name}</p>
            <p className="text-xs text-white/60">{profile?.email}</p>
          </div>
          
          <div className="h-px bg-white/5 my-4"></div>
          
          {/* Navegação */}
          <ScrollArea className="flex-1 px-1" style={{ height: "calc(100vh - 280px)" }}>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.isExact}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Footer com botão de logout */}
        <div className="mt-auto p-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </div>
      
      {/* Conteúdo principal - sempre com margin-left para compensar o sidebar fixo */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
