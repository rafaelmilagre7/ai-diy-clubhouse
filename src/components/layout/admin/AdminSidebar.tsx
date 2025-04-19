
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  ChevronLeft,
  Menu,
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const { profile, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async (e: Event) => {
    e.preventDefault();
    
    try {
      setIsLoggingOut(true);
      // Limpar token do localStorage para garantir logout
      localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
      
      // Usar o signOut do contexto de autenticação
      await signOut();
      
      // Redirecionamento forçado para a página de autenticação
      toast.success("Logout realizado com sucesso");
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Força redirecionamento para login em caso de falha
      window.location.href = '/auth';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-white shadow-sm transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-0 md:w-20"
      )}
    >
      <div className={cn("flex flex-col h-full", !sidebarOpen && "md:flex hidden")}>
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center">
              <img 
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
                alt="VIVER DE IA Club" 
                className="h-8 w-auto" 
              />
            </Link>
          ) : (
            <Link to="/admin" className="mx-auto">
              <div className="h-8 w-8 flex items-center justify-center bg-[#0ABAB5] rounded-full text-white font-bold">
                VI
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={sidebarOpen ? "ml-auto text-muted-foreground hover:text-foreground" : "mx-auto mt-2"}
            aria-label={sidebarOpen ? "Colapsar menu" : "Expandir menu"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </Button>
        </div>
        
        <Separator />

        {/* Navigation */}
        <AdminSidebarNav sidebarOpen={sidebarOpen} />

        <Separator />
        
        {/* User menu */}
        <div className="p-3 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 px-2",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{profile?.name}</span>
                    <span className="text-xs text-muted-foreground">Administrador</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};
