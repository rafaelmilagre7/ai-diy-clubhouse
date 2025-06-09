
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Mail,
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
  Megaphone,
  LogOut,
  ArrowLeft
} from "lucide-react";

export const AdminSidebarNav = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const handleBackToMember = () => {
    navigate("/dashboard");
    toast.success("Retornando para a área de membro");
  };

  return (
    <div className="flex flex-col h-full px-1">
      {/* Área de navegação com scroll */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 pr-3">
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

      {/* Botões fixos sempre visíveis na parte inferior */}
      <div className="flex-shrink-0 pt-4 pb-4 space-y-2">
        <Separator className="bg-white/5 mb-4" />
        
        {/* Botão destacado para voltar à área de membro */}
        <Button 
          variant="default" 
          className="w-full justify-start bg-primary hover:bg-primary-hover text-white"
          onClick={handleBackToMember}
        >
          <ArrowLeft className="h-5 w-5 mr-3" />
          Área de Membro
        </Button>
        
        {/* Botão de logout */}
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
  );
};
