
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Lightbulb,
  Settings,
  MessageSquare,
  User,
  Award,
  Home,
  Gift,
  Map,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MemberSidebarNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Settings,
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
    {
      title: "Conquistas",
      href: "/achievements",
      icon: Award,
    },
    {
      title: "Trilha de Implementação",
      href: "/implementation-trail",
      icon: Map,
    },
    {
      title: "Perfil",
      href: "/profile",
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && location.pathname === "/") {
      return true;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="space-y-1 py-2">
      {menuItems.map((item) => (
        <Button
          key={item.href}
          variant={isActive(item.href) ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            isActive(item.href) && "bg-viverblue hover:bg-viverblue/90"
          )}
          asChild
        >
          <Link to={item.href} className="flex items-center">
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}

      {isAdmin && (
        <Button variant="outline" className="w-full justify-start mt-4" asChild>
          <Link to="/admin" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Painel Admin
            <Badge variant="outline" className="ml-auto bg-viverblue text-white">
              Admin
            </Badge>
          </Link>
        </Button>
      )}
    </div>
  );
}
