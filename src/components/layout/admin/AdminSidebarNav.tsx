
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Calendar,
  GraduationCap,
  Gift,
  Shield,
  Activity
} from "lucide-react";
import { AdminNavItem } from "./AdminNavItem";

export const AdminSidebarNav = () => {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      isActive: location.pathname === "/admin"
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      isActive: location.pathname.startsWith("/admin/analytics")
    },
    {
      label: "Usuários",
      icon: Users,
      href: "/admin/users",
      isActive: location.pathname.startsWith("/admin/users")
    },
    {
      label: "Soluções",
      icon: Settings,
      href: "/admin/solutions",
      isActive: location.pathname.startsWith("/admin/solutions")
    },
    {
      label: "Papéis",
      icon: Shield,
      href: "/admin/roles",
      isActive: location.pathname.startsWith("/admin/roles")
    },
    {
      label: "Comunicações",
      icon: MessageSquare,
      href: "/admin/communications",
      isActive: location.pathname.startsWith("/admin/communications")
    },
    {
      label: "Eventos",
      icon: Calendar,
      href: "/admin/events",
      isActive: location.pathname.startsWith("/admin/events")
    },
    {
      label: "Aprendizado",
      icon: GraduationCap,
      href: "/admin/learning",
      isActive: location.pathname.startsWith("/admin/learning")
    },
    {
      label: "Benefícios",
      icon: Gift,
      href: "/admin/benefits",
      isActive: location.pathname.startsWith("/admin/benefits")
    },
    {
      label: "Diagnóstico",
      icon: Activity,
      href: "/admin/diagnostics",
      isActive: location.pathname.startsWith("/admin/diagnostics")
    }
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="space-y-1 px-4">
        {navigationItems.map((item) => (
          <AdminNavItem
            key={item.href}
            {...item}
          />
        ))}
      </div>
    </nav>
  );
};
