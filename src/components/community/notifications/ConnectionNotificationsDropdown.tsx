
import React, { useState, useEffect } from 'react';
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
import { Bell, Check, X, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/utils/user';
import { toast } from 'sonner';

interface ConnectionNotification {
  id: string;
  type: 'request' | 'accepted' | 'rejected';
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
    company_name?: string;
  };
}

export const ConnectionNotificationsDropdown = () => {
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notifications = [] } = useQuery({
    queryKey: ['connection-notifications'],
    queryFn: async (): Promise<ConnectionNotification[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('connection_notifications')
        .select(`
          id,
          type,
          is_read,
          created_at,
          sender:profiles!connection_notifications_sender_id_fkey(
            id, name, avatar_url, company_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refetch a cada 30 segundos
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('connection_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
    }
  });

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification: ConnectionNotification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getNotificationText = (notification: ConnectionNotification) => {
    switch (notification.type) {
      case 'request':
        return 'enviou uma solicitação de conexão';
      case 'accepted':
        return 'aceitou sua solicitação de conexão';
      case 'rejected':
        return 'rejeitou sua solicitação de conexão';
      default:
        return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Configurar realtime para notificações
  useEffect(() => {
    const channel = supabase
      .channel('connection-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_notifications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connection-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
          Notificações
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} novas</Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.sender.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(notification.sender.name)}
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
                      <span className="font-medium">{notification.sender.name}</span>
                      {' '}
                      {getNotificationText(notification)}
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
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
