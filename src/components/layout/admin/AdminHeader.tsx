
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminHeader = ({ sidebarOpen, setSidebarOpen }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Painel Administrativo</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie usuários, soluções e configurações do VIVER DE IA Club
        </p>
      </div>
    </header>
  );
};
