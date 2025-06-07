
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wrench,
  BookOpen,
  BarChart3,
  Lightbulb,
  CalendarDays,
  UserCog,
  Mail,
  LineChart,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarNavProps {
  sidebarOpen?: boolean;
}

const AdminSidebarNav = ({ sidebarOpen = true }: AdminSidebarNavProps) => {
  const navItems = [
    {
      to: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
      end: true
    },
    {
      to: "/admin/users",
      icon: Users,
      label: "Usuários"
    },
    {
      to: "/admin/invites",
      icon: Mail,
      label: "Convites"
    },
    {
      to: "/admin/whatsapp-debug",
      icon: MessageCircle,
      label: "Debug WhatsApp"
    },
    {
      to: "/admin/tools",
      icon: Wrench,
      label: "Ferramentas"
    },
    {
      to: "/admin/solutions",
      icon: BookOpen,
      label: "Soluções"
    },
    {
      to: "/admin/analytics",
      icon: BarChart3,
      label: "Analytics"
    },
    {
      to: "/admin/benefits",
      icon: LineChart,
      label: "Benefícios"
    },
    {
      to: "/admin/suggestions",
      icon: Lightbulb,
      label: "Sugestões"
    },
    {
      to: "/admin/events",
      icon: CalendarDays,
      label: "Eventos"
    },
    {
      to: "/admin/roles",
      icon: UserCog,
      label: "Perfis"
    }
  ];

  return (
    <nav className="flex flex-col space-y-1 p-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AdminSidebarNav;
