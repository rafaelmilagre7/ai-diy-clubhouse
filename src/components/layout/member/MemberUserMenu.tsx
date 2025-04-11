
import { Link } from "react-router-dom";
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
import { useAuth } from "@/contexts/auth";

interface MemberUserMenuProps {
  sidebarOpen: boolean;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
}

export const MemberUserMenu = ({ 
  sidebarOpen, 
  profileName, 
  profileEmail, 
  profileAvatar,
  getInitials 
}: MemberUserMenuProps) => {
  const { signOut } = useAuth();
  
  return (
    <div className="p-3">
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
              <AvatarImage src={profileAvatar} />
              <AvatarFallback>{getInitials(profileName)}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{profileName}</span>
                <span className="text-muted-foreground text-xs truncate max-w-[150px]">
                  {profileEmail}
                </span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link to="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onSelect={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
