
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: MemberSidebarNavProps) => {
  const location = useLocation();

  // Corrigido o problema de chaves duplicadas mudando os paths
  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      exact: true,
      id: "dashboard"
    },
    {
      title: "Soluções",
      icon: BookOpen,
      path: "/dashboard", // Mesmo caminho para evitar navegação desnecessária
      exact: false,
      badge: "Explorar",
      id: "solutions"
    },
    {
      title: "Minhas Conquistas",
      icon: Award,
      path: "/profile", // Redirecionando para profile temporariamente
      exact: false,
      id: "achievements"
    },
    {
      title: "Meu Perfil",
      icon: User,
      path: "/profile",
      exact: false,
      id: "profile"
    }
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    
    if (item.path === "/dashboard" && (location.pathname === "/dashboard" || location.pathname === "/")) {
      return true;
    }
    
    return location.pathname === item.path || 
           (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.id} // Usando id único em vez de path
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
