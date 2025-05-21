
import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useConnectionNotifications } from '@/hooks/community/useConnectionNotifications';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useConnectionRequests } from '@/hooks/community/useConnectionRequests';

export const ConnectionNotificationsDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useConnectionNotifications();
  
  const { acceptConnectionRequest, rejectConnectionRequest } = useConnectionRequests();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleAccept = async (requesterId: string, notificationId: string) => {
    setRespondingTo(requesterId);
    try {
      await acceptConnectionRequest(requesterId);
      await markAsRead(notificationId);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleReject = async (requesterId: string, notificationId: string) => {
    setRespondingTo(requesterId);
    try {
      await rejectConnectionRequest(requesterId);
      await markAsRead(notificationId);
    } finally {
      setRespondingTo(null);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-viverblue">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação para exibir
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 hover:bg-accent ${!notification.is_read ? 'bg-accent/50' : ''}`}
              >
                <div className="flex items-start space-x-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.sender_avatar || undefined} alt={notification.sender_name || "Usuário"} />
                    <AvatarFallback>{getInitials(notification.sender_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">
                      <Link to={`/comunidade/membro/${notification.sender_id}`} className="hover:underline">
                        {notification.sender_name}
                      </Link>
                      {notification.type === 'request' && " enviou uma solicitação de conexão"}
                      {notification.type === 'accepted' && " aceitou sua solicitação de conexão"}
                      {notification.type === 'rejected' && " rejeitou sua solicitação de conexão"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(notification.created_at)}
                    </p>
                    
                    {notification.type === 'request' && !notification.is_read && (
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => handleReject(notification.sender_id, notification.id)}
                          disabled={respondingTo === notification.sender_id}
                        >
                          Recusar
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => handleAccept(notification.sender_id, notification.id)}
                          disabled={respondingTo === notification.sender_id}
                        >
                          Aceitar
                        </Button>
                      </div>
                    )}
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-viverblue"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            to="/comunidade/conexoes" 
            className="justify-center text-center cursor-pointer"
          >
            Ver todas as conexões
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
