
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { MemberUserMenu } from './MemberUserMenu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface MemberHeaderProps {
  onToggleSidebar: () => void;
}

export const MemberHeader = ({ onToggleSidebar }: MemberHeaderProps) => {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold">Viver de IA</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <MemberUserMenu />
      </div>
    </header>
  );
};
