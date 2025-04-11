
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Users as UsersIcon,
  Settings,
  BarChart,
  FileEdit
} from "lucide-react";

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
    },
    {
      title: "Soluções",
      icon: FileText,
      path: "/admin/solutions",
    },
    {
      title: "Nova Solução",
      icon: FileEdit,
      path: "/admin/solutions/new",
    },
    {
      title: "Usuários",
      icon: UsersIcon,
      path: "/admin/users",
    },
    {
      title: "Métricas",
      icon: BarChart,
      path: "/admin/analytics",
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-100",
            location.pathname === item.path ? "bg-gray-100 font-medium" : "text-gray-900"
          )}
        >
          <item.icon size={20} className="text-viverblue" />
          {sidebarOpen && <span>{item.title}</span>}
        </Link>
      ))}
    </nav>
  );
};
