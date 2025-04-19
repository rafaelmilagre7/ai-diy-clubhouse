
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Settings, 
  BarChart, 
  Wrench,
  Gift
} from "lucide-react";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/admin" || pathname === "/admin/dashboard",
    },
    {
      name: "Soluções",
      href: "/admin/solutions",
      icon: <PlusCircle className="h-5 w-5" />,
      active: pathname.includes("/admin/solutions") || pathname.includes("/admin/solution"),
    },
    {
      name: "Ferramentas",
      href: "/admin/tools",
      icon: <Wrench className="h-5 w-5" />,
      active: pathname.includes("/admin/tools"),
    },
    {
      name: "Usuários",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/admin/users",
    },
    {
      name: "Métricas",
      href: "/admin/analytics",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/admin/analytics",
    },
    {
      name: "Benefícios",
      href: "/admin/benefits",
      icon: <Gift className="h-5 w-5" />,
      active: pathname === "/admin/benefits",
    },
    {
      name: "Configurações",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/admin/settings",
    },
  ];

  return (
    <div className="flex flex-col gap-1 py-2">
      <TooltipProvider delayDuration={0}>
        {navItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link to={item.href} className="block">
                <Button
                  variant={item.active ? "default" : "ghost"}
                  size={sidebarOpen ? "default" : "icon"}
                  className={cn(
                    "w-full justify-start",
                    item.active && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span className="ml-2">{item.name}</span>}
                </Button>
              </Link>
            </TooltipTrigger>
            {!sidebarOpen && (
              <TooltipContent side="right">
                {item.name}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};
