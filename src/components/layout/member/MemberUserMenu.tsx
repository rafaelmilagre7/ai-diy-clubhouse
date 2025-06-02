
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
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
import { useNavigate } from "react-router-dom";

interface MemberUserMenuProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
}

export const MemberUserMenu: React.FC<MemberUserMenuProps> = ({
  sidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="px-3 py-4">
      <div className="flex items-center gap-3">
        {/* Notification Center */}
        <NotificationCenter />
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-2 flex items-center gap-3 w-full justify-start hover:bg-white/10",
                !sidebarOpen && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileAvatar} />
                <AvatarFallback className="bg-viverblue text-white text-sm">
                  {getInitials(profileName)}
                </AvatarFallback>
              </Avatar>
              
              {sidebarOpen && (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium text-white truncate max-w-full">
                    {profileName || "Usuário"}
                  </span>
                  <span className="text-xs text-white/70 truncate max-w-full">
                    {profileEmail}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profileName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profileEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
