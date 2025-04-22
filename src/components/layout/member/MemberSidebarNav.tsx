
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Tool, 
  Trophy,
  Gift,
  MessageSquare,
  User,
  Settings,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface SidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: SidebarNavProps) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Trilha de Implementação",
      href: "/implementation-trail",
      icon: Trophy,
    },
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Tool,
    },
    {
      title: "Benefícios",
      href: "/benefits",
      icon: Gift,
    },
    {
      title: "Sugestões",
      href: "/suggestions",
      icon: MessageSquare,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              !sidebarOpen && "justify-center",
              isActive(item.href) && "bg-viverblue hover:bg-viverblue/90"
            )}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="h-4 w-4" />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          </Button>
        ))}

        {isAdmin && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 border-viverblue text-viverblue hover:bg-viverblue/10",
              !sidebarOpen && "justify-center"
            )}
            asChild
          >
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4" />
              {sidebarOpen && <span>Painel Admin</span>}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
