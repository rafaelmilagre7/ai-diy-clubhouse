
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award,
  User,
  BarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      title: "Implementações",
      icon: BarChart,
      path: "/implementations",
      id: "implementations"
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

  // Improved isActive function for more reliable route detection
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    
    if (path === "/dashboard" && 
        (currentPath === "/dashboard" || currentPath === "/" || currentPath === "")) {
      return true;
    }
    
    if (path === "/solutions" && 
        (currentPath.includes("/solution/") || currentPath.includes("/implement/"))) {
      return true;
    }
    
    return currentPath.startsWith(path);
  };

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      <TooltipProvider delayDuration={300}>
        {navItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                  isActive(item.path)
                    ? "bg-[#0ABAB5]/10 text-[#0ABAB5]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center">
                  <item.icon size={20} className={cn(
                    sidebarOpen ? "mr-3" : "mx-auto",
                    isActive(item.path) ? "text-[#0ABAB5]" : "text-muted-foreground"
                  )} />
                  {sidebarOpen && <span className="font-medium">{item.title}</span>}
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
        ))}
      </TooltipProvider>
    </nav>
  );
};
