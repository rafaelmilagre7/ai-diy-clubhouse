
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, MessageCircle } from "lucide-react";
import { MemberUserMenu } from "./MemberUserMenu";
import { RealtimeNotificationsBadge } from "@/components/realtime/RealtimeNotificationsBadge";
import { InboxDrawer } from "@/components/networking/chat/InboxDrawer";
import { useUnreadCount } from "@/hooks/networking/useUnreadCount";
import { useNavigate } from "react-router-dom";

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
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const navigate = useNavigate();

  return (
    <>
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
          {/* Inbox de Mensagens */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsInboxOpen(true)}
          >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notificações Realtime */}
          <RealtimeNotificationsBadge 
            onClick={() => navigate('/notifications')}
          />
          
          {/* Menu do usuário */}
          <MemberUserMenu />
        </div>
      </header>

      {/* Drawer de Inbox */}
      <InboxDrawer open={isInboxOpen} onOpenChange={setIsInboxOpen} />
    </>
  );
};
