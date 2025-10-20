import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isLoading 
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida (incluindo notificações agrupadas)
    if (!notification.is_read) {
      const idsToMark = notification.grouped_ids || [notification.id];
      await markAsRead(idsToMark);
    }

    // Navegar para a URL se houver
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      // Comentários
      case 'comment_liked':
        return '👍';
      case 'comment_replied':
        return '💬';
      
      // Learning
      case 'new_course':
        return '🎓';
      case 'new_lesson':
        return '📚';
      case 'new_module':
        return '📂';
      
      // Soluções
      case 'new_solution':
        return '💡';
      
      // Sugestões
      case 'suggestion_status_change':
        return '📋';
      case 'official_suggestion_comment':
        return '📢';
      
      // Comunidade
      case 'topic_solved':
        return '✅';
      case 'community_reply':
        return '💬';
      case 'community_mention':
        return '👤';
      
      // Eventos
      case 'event_reminder_24h':
        return '📅';
      case 'event_reminder_1h':
        return '⏰';
      
      // Certificados
      case 'certificate_available':
        return '🎖️';
      
      // Gamificação
      case 'suggestion_milestone':
        return '🎯';
      case 'topic_milestone':
        return '👥';
      case 'course_reminder':
        return '📚';
      case 'solution_reminder':
        return '💡';
      case 'connection_anniversary':
        return '🎉';
      
      // IA Insights
      case 'ai_recommendation':
        return '🤖';
      case 'ai_learning_path':
        return '🎯';
      case 'churn_prevention':
        return '💙';
      case 'completion_motivation':
        return '🚀';
      case 'weekly_summary':
        return '📊';
      
      // Admin
      case 'admin_communication':
        return '📢';
      case 'urgent':
        return '⚠️';
      
      default:
        return '🔔';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative transition-all duration-fast hover:bg-surface-elevated/50",
            unreadCount > 0 && "animate-pulse-subtle"
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center",
              "rounded-full bg-status-error text-[10px] font-bold text-white",
              "animate-scale-in shadow-glow-sm"
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-80 p-0 bg-surface-elevated border-border shadow-elegant",
          "animate-fade-in"
        )}
      >
        <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-textPrimary">Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 px-2 text-xs text-aurora-primary hover:text-aurora-primary/80 hover:bg-aurora-primary/10"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-textSecondary/30 mb-3" />
              <p className="text-sm text-textSecondary">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "flex items-start gap-3 p-4 cursor-pointer transition-all duration-fast",
                  "border-b border-border/50 hover:bg-surface-elevated/70",
                  !notification.is_read && "bg-aurora-primary/5"
                )}
              >
                <span className="text-2xl mt-1 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={cn(
                      "text-sm font-medium leading-tight",
                      !notification.is_read ? "text-textPrimary" : "text-textSecondary"
                    )}>
                      {notification.title}
                      {notification.grouped_count && notification.grouped_count > 1 && (
                        <span className={cn(
                          "ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full",
                          "bg-aurora-primary/20 text-aurora-primary"
                        )}>
                          {notification.grouped_count}
                        </span>
                      )}
                    </p>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-aurora-primary rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                    )}
                  </div>
                  
                  <p className="text-xs text-textSecondary line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                  
                  <span className="text-xs text-textSecondary/60">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="w-full text-xs text-aurora-primary hover:text-aurora-primary/80 hover:bg-aurora-primary/10"
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
