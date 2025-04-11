
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Plus,
  Users as UsersIcon,
  Settings,
  BarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
      exact: true
    },
    {
      title: "Soluções",
      icon: FileText,
      path: "/admin/solutions",
      exact: false,
      badge: "Gerenciar"
    },
    {
      title: "Nova Solução",
      icon: Plus,
      path: "/admin/solutions/new",
      exact: true
    },
    {
      title: "Usuários",
      icon: UsersIcon,
      path: "/admin/users",
      exact: false
    },
    {
      title: "Métricas",
      icon: BarChart,
      path: "/admin/analytics",
      exact: false
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/admin/settings",
      exact: false
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    
    return location.pathname === item.path || 
           (item.path !== "/admin" && location.pathname.startsWith(item.path));
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
            isActive(item)
              ? "bg-[#0ABAB5]/10 text-[#0ABAB5]" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center">
            <item.icon size={20} className={cn(
              "mr-3",
              isActive(item) ? "text-[#0ABAB5]" : "text-muted-foreground"
            )} />
            {sidebarOpen && <span>{item.title}</span>}
          </div>
          
          {sidebarOpen && item.badge && (
            <Badge variant="outline" className="text-xs bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/20">
              {item.badge}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
};
