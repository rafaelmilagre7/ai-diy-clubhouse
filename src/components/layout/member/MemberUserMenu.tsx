import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth";
import { LogOut, Settings, User, Bell, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MemberUserMenu = () => {
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
          className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
        >
          <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/30">
            <AvatarImage src={profile?.avatar_url} alt={profile?.name || "Usuário"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {getInitials(profile?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-[280px] p-0 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden" 
        align="end" 
        sideOffset={8}
      >
        {/* Header com informações do usuário */}
        <div className="relative p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-lg">
              <AvatarImage src={profile?.avatar_url} alt={profile?.name || "Usuário"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-base">
                {getInitials(profile?.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">
                {profile?.name || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "Sem email"}
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Menu Items */}
        <div className="p-2 space-y-1">
          <DropdownMenuItem asChild>
            <Link 
              to="/profile" 
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer",
                "hover:bg-accent/80 transition-colors duration-200",
                "focus:bg-accent/80 focus:outline-none"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm">Meu Perfil</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link 
              to="/profile/notifications" 
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer",
                "hover:bg-accent/80 transition-colors duration-200",
                "focus:bg-accent/80 focus:outline-none"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10">
                  <Bell className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium text-sm">Notificações</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link 
              to="/settings" 
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer",
                "hover:bg-accent/80 transition-colors duration-200",
                "focus:bg-accent/80 focus:outline-none"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/10">
                  <Settings className="h-4 w-4 text-purple-500" />
                </div>
                <span className="font-medium text-sm">Configurações</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>
        </div>

        <Separator className="bg-border/50 my-2" />

        {/* Botão Sair */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={() => signOut()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
              "hover:bg-destructive/10 transition-colors duration-200",
              "focus:bg-destructive/10 focus:outline-none",
              "text-destructive hover:text-destructive"
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Sair da conta</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
