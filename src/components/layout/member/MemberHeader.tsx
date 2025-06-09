
import React from 'react';
import { MemberUserMenu } from './MemberUserMenu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface MemberHeaderProps {
  onToggleSidebar: () => void;
}

export const MemberHeader = ({ onToggleSidebar }: MemberHeaderProps) => {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <div className="lg:block">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <MemberUserMenu />
      </div>
    </header>
  );
};
