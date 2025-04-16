
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

  // Define the navigation items
  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      id: "dashboard"
    },
    {
      title: "Soluções",
      icon: BookOpen,
      path: "/solutions",
      badge: "Explorar",
      id: "solutions"
    },
    {
      title: "Minhas Conquistas",
      icon: Award,
      path: "/achievements",
      id: "achievements"
    },
    {
      title: "Meu Perfil",
      icon: User,
      path: "/profile",
      id: "profile"
    }
  ];

  // Simplified isActive function for more reliable route detection
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    
    // Handle special cases
    if (path === "/dashboard" && 
        (currentPath === "/dashboard" || currentPath === "/" || currentPath === "")) {
      return true;
    }
    
    if (path === "/solutions" && 
        (currentPath.includes("/solution/") || currentPath.includes("/implement/"))) {
      return true;
    }
    
    if (path === "/achievements" && 
        (currentPath === "/profile" && location.search.includes("tab=achievements"))) {
      return true;
    }
    
    if (path === "/profile" && 
        currentPath === "/profile" && !location.search.includes("tab=achievements")) {
      return true;
    }
    
    // Direct match for other cases
    return currentPath === path;
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.id}
          to={item.path === "/solutions" ? "/dashboard" : item.path}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
            isActive(item.path)
              ? "bg-[#0ABAB5]/10 text-[#0ABAB5]" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center">
            <item.icon size={20} className={cn(
              "mr-3",
              isActive(item.path) ? "text-[#0ABAB5]" : "text-muted-foreground"
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
