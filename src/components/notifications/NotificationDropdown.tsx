
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Bell, CheckCheck, Trash2, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin_communication':
        return '📢';
      case 'message':
        return '💬';
      case 'urgent':
        return '🚨';
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover-scale">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="error" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between p-4">
          <Text variant="subheading" textColor="primary">
            Notificações
          </Text>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 px-2 text-xs hover-scale"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings/notifications')}
              className="h-6 px-2 text-xs hover-scale"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-3">
                <Bell className="h-8 w-8 text-text-muted mx-auto" />
              </div>
              <Text variant="body" textColor="tertiary">
                Nenhuma notificação
              </Text>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                <div className={cn(
                  "w-full p-4 border-b border-border-subtle last:border-b-0 transition-colors hover:bg-surface-hover",
                  !notification.is_read && "bg-primary/5 border-l-4 border-l-primary"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                        <Text variant="body" textColor="primary" weight="medium" className="truncate">
                          {notification.title}
                        </Text>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <Text variant="body-small" textColor="secondary" className="line-clamp-2">
                        {notification.message}
                      </Text>
                      
                      <div className="flex items-center justify-between">
                        <Text variant="caption" textColor="tertiary">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </Text>
                        
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="h-6 w-6 p-0 hover-scale"
                            >
                              <CheckCheck className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-text-tertiary hover:text-error hover-scale"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
