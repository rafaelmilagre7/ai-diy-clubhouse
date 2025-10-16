
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AdminUserMenu } from "./AdminUserMenu";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminContentProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminContent = ({ children, sidebarOpen, setSidebarOpen }: AdminContentProps) => {
  return (
    <main 
      className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        // Ajustar margem baseado no estado da sidebar
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}
    >
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden -ml-1"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        <div className="flex-1">
          <h1 className="font-semibold">Painel Administrativo</h1>
        </div>

        <div 
          className="flex items-center gap-2 relative z-20"
          onClick={(e) => {
            console.log("🔍 [ADMIN-HEADER] Clique na área de ações do usuário", e);
          }}
        >
          <NotificationCenter />
          <AdminUserMenu />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl w-full">
          {children}
        </div>
      </div>
    </main>
  );
};
