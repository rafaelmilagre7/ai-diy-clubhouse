
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Lightbulb, 
  BarChart3, 
  MessageSquare,
  Calendar,
  Shield,
  UserPlus,
  TrendingUp,
  MessageCircle,
  Megaphone
} from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Comunicações", 
    href: "/admin/communications",
    icon: Megaphone,
  },
  {
    title: "Ferramentas",
    href: "/admin/tools",
    icon: Wrench,
  },
  {
    title: "Soluções",
    href: "/admin/solutions", 
    icon: Lightbulb,
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
    title: "Papéis",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Convites",
    href: "/admin/invites",
    icon: UserPlus,
  },
  {
    title: "Benefícios",
    href: "/admin/benefits",
    icon: TrendingUp,
  },
  {
    title: "WhatsApp Debug",
    href: "/admin/whatsapp-debug",
    icon: MessageCircle,
  },
];

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {adminNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "text-gray-300 hover:bg-white/5 hover:text-white",
              isActive && "bg-white/10 text-white",
              !sidebarOpen && "justify-center px-2"
            )
          }
        >
          <item.icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              sidebarOpen ? "mr-3" : "mx-auto"
            )}
          />
          {sidebarOpen && (
            <span className="truncate">{item.title}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
