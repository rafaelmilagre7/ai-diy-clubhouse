
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { MemberUserMenu } from "./MemberUserMenu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

interface MemberHeaderProps {
  onSignOut: () => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string;
  getInitials: (name: string | null) => string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({
  onSignOut,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Botão de menu mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer para desktop */}
      <div className="hidden md:block" />

      {/* Área de ações do usuário */}
      <div className="flex items-center gap-2">
        {/* Notificações */}
        <NotificationDropdown />
        
        {/* Menu do usuário */}
        <MemberUserMenu />
      </div>
    </header>
  );
};
