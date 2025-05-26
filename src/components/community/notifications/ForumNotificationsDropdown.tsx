
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Reply, AtSign, CheckCircle, MessageSquare } from 'lucide-react';
import { useForumNotifications } from '@/hooks/community/useForumNotifications';
import { getInitials } from '@/utils/user';
import { Link } from 'react-router-dom';

export const ForumNotificationsDropdown = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useForumNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reply':
        return <Reply className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-green-500" />;
      case 'solution_marked':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getNotificationText = (type: string) => {
    switch (type) {
      case 'reply':
        return 'respondeu ao seu tópico';
      case 'mention':
        return 'mencionou você em um post';
      case 'solution_marked':
        return 'marcou sua resposta como solução';
      default:
        return 'interagiu com você';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações do Fórum
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{unreadCount} novas</Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                }}
                asChild
              >
                <Link 
                  to={`/comunidade/topico/${notification.topic_id}`}
                  className="block"
                >
                  <div className="flex items-start space-x-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.triggered_by?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(notification.triggered_by?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-1">
                        {getNotificationIcon(notification.type)}
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm">
                        <span className="font-medium">{notification.triggered_by?.name}</span>
                        {' '}
                        {getNotificationText(notification.type)}
                      </p>
                      
                      <p className="text-xs font-medium text-primary truncate">
                        {notification.topic?.title}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
