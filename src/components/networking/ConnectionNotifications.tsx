import { Bell, Check, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConnectionNotifications } from '@/hooks/useConnectionNotifications';
import { useConnections } from '@/hooks/useConnections';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

export const ConnectionNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useConnectionNotifications();
  const { acceptConnection, rejectConnection, checkConnection } = useConnections();

  const handleAccept = async (notificationId: string, senderId: string) => {
    // Encontrar a conexão correspondente
    const connection = await findConnectionBetweenUsers(senderId);
    if (connection) {
      await acceptConnection.mutateAsync(connection.id);
      await markAsRead.mutateAsync(notificationId);
    }
  };

  const handleReject = async (notificationId: string, senderId: string) => {
    const connection = await findConnectionBetweenUsers(senderId);
    if (connection) {
      await rejectConnection.mutateAsync(connection.id);
      await markAsRead.mutateAsync(notificationId);
    }
  };

  const findConnectionBetweenUsers = async (otherUserId: string) => {
    return await checkConnection(otherUserId);
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-textSecondary text-center py-8">
            Nenhuma notificação por enquanto
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <Badge className="bg-aurora-primary text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border transition-colors ${
              !notification.is_read 
                ? 'bg-aurora-primary/5 border-aurora-primary/20' 
                : 'bg-background border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {notification.sender.avatar_url ? (
                    <img
                      src={notification.sender.avatar_url}
                      alt={notification.sender.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-textPrimary">
                    {notification.type === 'connection_request' 
                      ? `${notification.sender.name} enviou uma solicitação de conexão`
                      : `${notification.sender.name} aceitou sua solicitação de conexão`
                    }
                  </p>
                  {notification.sender.company_name && (
                    <p className="text-sm text-textSecondary">
                      {notification.sender.current_position} na {notification.sender.company_name}
                    </p>
                  )}
                  <p className="text-xs text-textSecondary mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notification.type === 'connection_request' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-aurora-primary hover:bg-aurora-primary/90"
                      onClick={() => handleAccept(notification.id, notification.sender_id)}
                      disabled={acceptConnection.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(notification.id, notification.sender_id)}
                      disabled={rejectConnection.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead.mutate(notification.id)}
                  >
                    Marcar como lida
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};