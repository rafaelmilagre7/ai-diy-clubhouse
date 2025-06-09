
import React from 'react';
import { MemberUserMenu } from './MemberUserMenu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Menu, Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MemberHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

export const MemberHeader = ({ onToggleSidebar, sidebarOpen = false }: MemberHeaderProps) => {
  return (
    <header className="h-16 border-b border-border-subtle bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden hover:bg-surface-hover"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop title */}
        <div className="hidden md:block">
          <Text variant="subsection" textColor="primary" className="font-semibold">
            Dashboard
          </Text>
        </div>

        {/* Search bar - Hidden on mobile */}
        <div className="hidden lg:flex items-center relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar soluções..."
              className="pl-10 w-64 bg-surface-elevated border-border-subtle"
              variant="modern"
              inputSize="sm"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Mobile search button */}
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-surface-hover">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <NotificationDropdown />
        </div>

        {/* Settings button - Desktop only */}
        <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-surface-hover">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <MemberUserMenu />
      </div>
    </header>
  );
};
