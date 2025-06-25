
import { useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Wrench, 
  FileText, 
  Calendar, 
  UserCheck, 
  Mail, 
  MessageSquare,
  GraduationCap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavigationLink } from "@/components/navigation/NavigationLink";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Ferramentas",
    href: "/admin/tools",
    icon: Wrench,
  },
  {
    title: "Soluções",
    href: "/admin/solutions",
    icon: FileText,
  },
  {
    title: "Formação (LMS)",
    href: "/formacao",
    icon: GraduationCap,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Sugestões",
    href: "/admin/suggestions",
    icon: MessageSquare,
  },
  {
    title: "Eventos",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: UserCheck,
  },
  {
    title: "Convites",
    href: "/admin/invites",
    icon: Mail,
  },
  {
    title: "Comunicações",
    href: "/admin/communications",
    icon: Mail,
  },
  {
    title: "Segurança",
    href: "/admin/security",
    icon: Shield,
  },
];

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || 
      (href !== "/admin" && location.pathname.startsWith(href));
  };

  return (
    <nav className="flex-1 px-3 py-2">
      <div className="flex flex-col space-y-1">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <NavigationLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group h-10",
                !sidebarOpen && "justify-center px-2",
                active 
                  ? "bg-white/15 text-white shadow-lg border border-white/30" 
                  : "text-neutral-200 hover:text-white hover:bg-white/10 hover:shadow-md"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="truncate">{item.title}</span>
              )}
            </NavigationLink>
          );
        })}
      </div>
    </nav>
  );
};
