
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Lightbulb,
  FileText,
  LogOut,
  Tool,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";

export const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const menuItems = [
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
      title: "Soluções",
      href: "/admin/solutions",
      icon: Lightbulb,
    },
    {
      title: "Ferramentas",
      href: "/admin/tools",
      icon: Tool,
    },
    {
      title: "Diagnóstico",
      href: "/admin/diagnostic",
      icon: AlertCircle,
    },
    {
      title: "Configurações",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== "/admin" && location.pathname.startsWith(href));
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-background">
      <div className="flex flex-col h-full">
        {/* Logo e título */}
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <img 
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
              alt="VIVER DE IA Club" 
              className="h-8 w-auto" 
            />
            <span className="font-semibold text-lg">Admin</span>
          </Link>
        </div>
        
        {/* Menu de navegação */}
        <div className="flex-1 overflow-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.href) && "bg-viverblue hover:bg-viverblue/90"
                )}
                asChild
              >
                <Link to={item.href} className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Rodapé com botão de logout */}
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
          <div className="mt-2 px-2 py-1.5 text-xs text-muted-foreground">
            <Link to="/dashboard" className="hover:underline">
              Voltar para área de membros
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
