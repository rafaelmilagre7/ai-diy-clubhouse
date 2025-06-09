
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-0.5 py-2">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                  "text-gray-300 hover:bg-white/5 hover:text-white",
                  isActive && "bg-white/10 text-white",
                  !sidebarOpen && "justify-center px-1.5"
                )
              }
            >
              <item.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  sidebarOpen ? "mr-2.5" : "mx-auto"
                )}
              />
              {sidebarOpen && (
                <span className="truncate text-xs">{item.title}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};
