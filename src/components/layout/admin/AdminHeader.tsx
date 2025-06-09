
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AdminUserMenu } from './AdminUserMenu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-3 lg:px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold">Painel Administrativo</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationDropdown />
        <AdminUserMenu />
      </div>
    </header>
  );
};
