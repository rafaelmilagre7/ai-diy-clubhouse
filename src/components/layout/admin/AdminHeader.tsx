
import React from 'react';
import { AdminUserMenu } from './AdminUserMenu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { Menu, Settings, BarChart3 } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  return (
    <Card variant="elevated" className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden hover-scale"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden md:block">
            <Text variant="heading" textColor="primary" className="font-semibold">
              Painel Administrativo
            </Text>
            <Text variant="body-small" textColor="secondary">
              Gestão completa da plataforma
            </Text>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <AdminUserMenu />
      </div>
    </Card>
  );
};
