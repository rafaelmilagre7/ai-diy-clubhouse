import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AdminUserMenu } from "./AdminUserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminContentProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const getPageTitle = (pathname: string): string => {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.includes("/users")) return "Gerenciar Usuários";
  if (pathname.includes("/tools")) return "Ferramentas";
  if (pathname.includes("/solutions")) return "Soluções";
  if (pathname.includes("/roles")) return "Gerenciar Roles";
  if (pathname.includes("/courses")) return "Cursos";
  if (pathname.includes("/categories")) return "Categorias";
  if (pathname.includes("/communications")) return "Comunicações";
  if (pathname.includes("/security")) return "Segurança";
  if (pathname.includes("/nps")) return "NPS Analytics";
  if (pathname.includes("/automations")) return "Automações";
  return "Painel Administrativo";
};

export const AdminContent = ({ children, sidebarOpen, setSidebarOpen }: AdminContentProps) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log("📍 [ADMIN-CONTENT] Conteúdo renderizado para:", location.pathname);
  }, [location.pathname]);
  return (
    <main 
      className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        // Ajustar margem baseado no estado da sidebar
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}
    >
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-sm border-b bg-background px-md relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden -ml-xs"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mr-sm h-4" />
        
        <div className="flex-1">
          <h1 className="font-semibold">{getPageTitle(location.pathname)}</h1>
        </div>

        <div 
          className="flex items-center gap-sm relative z-20"
          onClick={(e) => {
            console.log("🔍 [ADMIN-HEADER] Clique na área de ações do usuário", e);
          }}
        >
          <NotificationBell />
          <AdminUserMenu />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-lg">
        <div className="mx-auto max-w-7xl w-full">
          {children}
        </div>
      </div>
    </main>
  );
};
