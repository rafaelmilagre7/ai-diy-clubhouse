
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Megaphone, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications();

  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    // Marcar como lida
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navegar se tiver action_url
    if (notification.data?.action_url) {
      navigate(notification.data.action_url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin_communication':
        return <Megaphone className="w-4 h-4 text-primary" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-destructive bg-destructive/5';
      case 'high':
        return 'border-l-status-warning bg-status-warning/5';
      case 'normal':
        return 'border-l-primary bg-primary/5';
      default:
        return 'border-l-muted bg-muted/20';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-muted/50 transition-colors"
          onClick={(e) => {
            console.log("🔍 [NOTIFICATION-DROPDOWN] Clique detectado no trigger", e);
          }}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 max-h-[80vh] overflow-hidden bg-background border shadow-lg z-50"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-foreground">Notificações</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h5 className="font-medium text-foreground mb-1">Nenhuma notificação</h5>
              <p className="text-sm text-muted-foreground">
                Você está em dia! Não há notificações no momento.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative p-3 mb-2 rounded-lg border-l-2 cursor-pointer transition-all duration-200",
                    !notification.is_read 
                      ? "bg-muted/30 hover:bg-muted/50" 
                      : "bg-background hover:bg-muted/20",
                    getPriorityStyles(notification.data?.priority)
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className={cn(
                          "text-sm font-medium leading-tight",
                          !notification.is_read ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </h5>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                        
                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length > 10 && (
                <div className="text-center py-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    +{notifications.length - 10} notificações mais antigas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
