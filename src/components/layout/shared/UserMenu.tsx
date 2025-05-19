
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  sidebarOpen: boolean;
  profileName?: string | null;
  profileEmail?: string | null;
  profileAvatar?: string | null | undefined;
  getInitials: (name: string | null) => string;
  signOut: () => Promise<void>;
}

export function UserMenu({
  sidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut
}: UserMenuProps) {
  // Usar nome do perfil ou fallback
  const displayName = profileName || "Usuário";
  const displayEmail = profileEmail || "sem email";
  
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          {profileAvatar ? (
            <AvatarImage src={profileAvatar} alt={displayName} />
          ) : (
            <AvatarFallback className="bg-slate-700 text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          )}
        </Avatar>
        
        {sidebarOpen && (
          <div className="flex flex-col space-y-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate max-w-[140px]">
              {displayName}
            </p>
            <p className="text-xs text-white/70 truncate max-w-[140px]">
              {displayEmail}
            </p>
          </div>
        )}
      </div>
      
      {sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#181A2A]"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
