
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminUserMenuProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
}

export const AdminUserMenu = ({ 
  sidebarOpen, 
  profileName, 
  profileEmail, 
  profileAvatar,
  getInitials 
}: AdminUserMenuProps) => {
  const { signOut } = useAuth();

  return (
    <div className="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`w-full flex items-center gap-3 px-2 ${!sidebarOpen ? "justify-center" : "justify-start"}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileAvatar} alt={profileName || "Usuário"} />
              <AvatarFallback>{getInitials(profileName)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{profileName || "Usuário"}</span>
                <span className="text-xs text-muted-foreground">{profileEmail || "Sem email"}</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer w-full flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Dashboard Membro</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => signOut()}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
