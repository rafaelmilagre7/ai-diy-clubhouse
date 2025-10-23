import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useSimpleNotifications } from '@/hooks/realtime/useSimpleNotifications';

interface RealtimeNotificationsBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function RealtimeNotificationsBadge({ 
  onClick, 
  className 
}: RealtimeNotificationsBadgeProps) {
  const { user } = useAuth();

  // Buscar contagem de não lidas
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Backup: refetch a cada 30s
  });

  // Conectar ao realtime para atualizar contagem automaticamente
  const { isConnected } = useSimpleNotifications({
    enableSound: true,
    enableDesktopNotifications: true,
    enableToast: true,
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn('relative', className)}
    >
      <Bell className="h-5 w-5" />
      
      {/* Badge de contagem */}
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs animate-in zoom-in-50"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}

      {/* Indicador de conexão */}
      {isConnected && (
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-background animate-pulse" />
      )}
    </Button>
  );
}
