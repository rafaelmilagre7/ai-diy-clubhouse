
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Megaphone
} from "lucide-react";

export const AdminSidebarNav = () => {
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

  return (
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
  );
};
