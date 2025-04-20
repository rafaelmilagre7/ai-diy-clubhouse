
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Tool, 
  MessageSquare, 
  Users, 
  BarChart, 
  Settings 
} from "lucide-react";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Soluções", path: "/admin/solutions", icon: FileText },
    { name: "Ferramentas", path: "/admin/tools", icon: Tool },
    { name: "Sugestões", path: "/admin/suggestions", icon: MessageSquare },
    { name: "Usuários", path: "/admin/users", icon: Users },
    { name: "Métricas", path: "/admin/analytics", icon: BarChart },
    { name: "Configurações", path: "/admin/settings", icon: Settings },
  ];

  return (
    <nav className="px-2 py-4 flex-grow overflow-y-auto">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-[#0ABAB5]/10 text-[#0ABAB5]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                !sidebarOpen && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", !sidebarOpen && "mx-auto")} />
              {sidebarOpen && <span className="ml-3">{item.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
