
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Boxes, 
  BookOpen, 
  BarChart3, 
  Lightbulb, 
  CalendarDays, 
  UserCog, 
  Mail,
  MessageSquare,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    end: true // Para marcar ativo apenas na rota exata
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Soluções",
    href: "/admin/solutions",
    icon: Boxes
  },
  {
    title: "Benefícios",
    href: "/admin/benefits",
    icon: Zap
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3
  },
  {
    title: "Sugestões",
    href: "/admin/suggestions",
    icon: Lightbulb
  },
  {
    title: "Eventos",
    href: "/admin/events",
    icon: CalendarDays
  },
  {
    title: "Perfis",
    href: "/admin/roles",
    icon: UserCog
  },
  {
    title: "Convites",
    href: "/admin/invites",
    icon: Mail
  },
  {
    title: "Comunicações",
    href: "/admin/communications",
    icon: MessageSquare
  }
];

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                !sidebarOpen && "justify-center px-2"
              )
            }
            title={!sidebarOpen ? item.title : undefined}
          >
            <Icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
            {sidebarOpen && <span>{item.title}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};
