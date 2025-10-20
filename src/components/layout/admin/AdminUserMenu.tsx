
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

export const AdminUserMenu = () => {
  const { signOut, user, profile } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            console.log("🔍 [ADMIN-USER-MENU] Clique detectado no trigger", e);
          }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} alt={profile?.name || "Usuário"} />
            <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(profile?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56" 
        align="end" 
        forceMount
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-xs">
            <p className="text-sm font-medium leading-none">{profile?.name || "Usuário"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "Sem email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-sm h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            <Settings className="mr-sm h-4 w-4" />
            <span>Dashboard Membro</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-sm h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
