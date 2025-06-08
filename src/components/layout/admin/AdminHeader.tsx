
import React from 'react';
import { AdminUserMenu } from './AdminUserMenu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <div className="lg:block">
          <h1 className="text-xl font-semibold">Painel Administrativo</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <AdminUserMenu />
      </div>
    </header>
  );
};
