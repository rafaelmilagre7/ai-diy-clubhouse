
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Plus,
  Users as UsersIcon,
  Settings,
  BarChart,
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      exact: true,
      id: "admin-dashboard"
    },
    {
      title: "Soluções",
      icon: FileText,
      path: "/admin/solutions",
      exact: false,
      badge: "Gerenciar",
      id: "admin-solutions"
    },
    {
      title: "Nova Solução",
      icon: Plus,
      path: "/admin/solutions/new",
      exact: true,
      id: "admin-new-solution"
    },
    {
      title: "Usuários",
      icon: UsersIcon,
      path: "/admin/users",
      exact: false,
      id: "admin-users"
    },
    {
      title: "Métricas",
      icon: BarChart,
      path: "/admin/analytics",
      exact: false,
      id: "admin-analytics"
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/admin/settings",
      exact: false,
      id: "admin-settings"
    },
    {
      title: "Ferramentas",
      icon: Wrench,
      path: "/admin/tools",
      exact: false,
      id: "admin-tools"
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    console.log('Verificando ativo:', { 
      itemPath: item.path, 
      currentPath: location.pathname, 
      starts: location.pathname.startsWith(item.path),
      exact: item.exact
    });
    
    if (item.exact) {
      return location.pathname === item.path;
    }
    
    return location.pathname === item.path || 
           (item.path !== "/admin" && location.pathname.startsWith(item.path));
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      <TooltipProvider delayDuration={300}>
        {navItems.map((item) => {
          const active = isActive(item);
          console.log(`Item ${item.title}: ${active ? 'ativo' : 'inativo'}`);
          
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                    active
                      ? "bg-[#0ABAB5]/10 text-[#0ABAB5]" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon size={20} className={cn(
                      sidebarOpen ? "mr-3" : "mx-auto",
                      active ? "text-[#0ABAB5]" : "text-muted-foreground"
                    )} />
                    {sidebarOpen && <span>{item.title}</span>}
                  </div>
                  
                  {sidebarOpen && item.badge && (
                    <Badge variant="outline" className="text-xs bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/20">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent side="right">
                  {item.title}
                  {item.badge && ` (${item.badge})`}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </nav>
  );
};
