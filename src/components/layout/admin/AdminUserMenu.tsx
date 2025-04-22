
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";

interface AdminUserMenuProps {
  sidebarOpen: boolean;
  profileName?: string | null;
  profileEmail?: string | null;
  profileAvatar?: string | null;
  getInitials: (name: string | null) => string;
}

export const AdminUserMenu = ({
  sidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
}: AdminUserMenuProps) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="mt-auto p-4 border-t">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !sidebarOpen && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8">
              {profileAvatar ? (
                <AvatarImage src={profileAvatar} alt={profileName || "Usuário"} />
              ) : (
                <AvatarFallback className="bg-viverblue text-white">
                  {getInitials(profileName)}
                </AvatarFallback>
              )}
            </Avatar>
            {sidebarOpen && (
              <div className="text-left">
                <p className="text-sm font-medium leading-none">{profileName || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{profileEmail || "usuario@exemplo.com"}</p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
