
import { Link, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  Settings, 
  Users, 
  GraduationCap, 
  Award, 
  Calendar, 
  ClipboardList, 
  Lightbulb, 
  LucideIcon,
  MessageSquare,
  Certificate
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export function MemberSidebarNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  
  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon
    },
    {
      title: "Soluções",
      href: "/solutions",
      icon: ClipboardList
    },
    {
      title: "Formação",
      href: "/learning",
      icon: GraduationCap
    },
    {
      title: "Certificados",
      href: "/learning/certificates",
      icon: Certificate
    },
    {
      title: "Eventos",
      href: "/events",
      icon: Calendar
    },
    {
      title: "Conquistas",
      href: "/achievements",
      icon: Award
    },
    {
      title: "Sugestões",
      href: "/suggestions",
      icon: Lightbulb
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Settings
    }
  ];

  return (
    <nav className="space-y-1">
      {sidebarItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
            isActive(item.href) 
              ? "bg-secondary text-secondary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
