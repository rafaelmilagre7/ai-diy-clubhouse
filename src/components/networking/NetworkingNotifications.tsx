
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useUnreadNotificationsCount } from '@/hooks/networking/useNetworkingNotifications';

export const NetworkingNotifications: React.FC = () => {
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const handleNotificationsClick = () => {
    // TODO: Implementar modal ou página de notificações
    console.log('Abrir notificações de networking');
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleNotificationsClick}
        className="gap-2"
      >
        <Bell className="h-4 w-4" />
        Notificações
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};
