
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";

interface MemberUserMenuProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
  signOut: () => Promise<void>;
}

export const MemberUserMenu = ({ 
  sidebarOpen, 
  profileName, 
  profileEmail, 
  profileAvatar,
  getInitials,
  signOut
}: MemberUserMenuProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  const handleSignOut = async (e: Event) => {
    e.preventDefault();
    
    try {
      setIsLoggingOut(true);
      
      // Limpar token do localStorage para garantir logout
      localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Usar o signOut do contexto de autenticação
      await signOut();
      
      // Redirecionamento forçado para a página de autenticação
      toast.success("Logout realizado com sucesso");
      
      // Forçar redirecionamento via location.href para garantir reset completo da aplicação
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Força redirecionamento para login em caso de falha
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 px-2 hover:bg-[#181A2A] text-neutral-300",
              !sidebarOpen && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={profileAvatar} />
              <AvatarFallback className="bg-[#181A2A] text-viverblue">{getInitials(profileName)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium text-neutral-100">{profileName}</span>
                <span className="text-muted-foreground text-xs truncate max-w-[150px]">
                  {profileEmail}
                </span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#151823] border-white/5">
          <DropdownMenuLabel className="text-neutral-200">Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />
          <Link to="/profile">
            <DropdownMenuItem className="hover:bg-[#181A2A]">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem 
            disabled={isLoggingOut} 
            onSelect={handleSignOut}
            className="hover:bg-[#181A2A]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
