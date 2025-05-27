
import React, { useState } from 'react';
import { Bell, CheckCircle, Users, UserPlus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  useNetworkingNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  type NetworkingNotification
} from '@/hooks/networking/useNetworkingNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_matches':
      return <Users className="h-4 w-4 text-viverblue" />;
    case 'connection_request':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'connection_accepted':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'match_viewed':
      return <Eye className="h-4 w-4 text-yellow-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

interface NotificationItemProps {
  notification: NetworkingNotification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        !notification.is_read ? 'bg-viverblue/5 border-l-2 border-viverblue' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-viverblue' : ''}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-viverblue rounded-full" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export const NetworkingNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [], isLoading } = useNetworkingNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notificações de Networking</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="text-sm text-muted-foreground">Carregando...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <div className="text-sm text-muted-foreground">
                    Nenhuma notificação ainda
                  </div>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
