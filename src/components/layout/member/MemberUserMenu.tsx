
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

interface MemberUserMenuProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
  signOut: () => Promise<void>;
}

export function MemberUserMenu({ 
  sidebarOpen, 
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut 
}: MemberUserMenuProps) {
  // Log para diagnóstico
  console.log("MemberUserMenu renderizando:", {
    sidebarOpen,
    profileName,
    profileEmail,
    hasAvatar: !!profileAvatar
  });
  
  const initials = getInitials(profileName);
  
  return (
    <div className={`p-3 ${sidebarOpen ? 'flex items-center justify-between' : 'flex justify-center'}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent w-full flex justify-start">
            <div className={`flex items-center ${sidebarOpen ? 'w-full' : 'justify-center'}`}>
              <Avatar className="h-8 w-8">
                {profileAvatar ? (
                  <AvatarImage src={profileAvatar} alt={profileName || "Usuário"} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              
              {sidebarOpen && (
                <div className="ml-2 text-left">
                  <p className="text-sm font-medium text-white truncate max-w-[160px]">
                    {profileName || "Usuário"}
                  </p>
                  {profileEmail && (
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {profileEmail}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile/edit" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center cursor-pointer text-destructive focus:text-destructive" 
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
