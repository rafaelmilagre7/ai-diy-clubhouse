import { Bell, Check, X } from 'lucide-react';
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
import { NotificationAvatar } from './NotificationAvatar';
import { NotificationAvatarStack } from './NotificationAvatarStack';
import { useState } from 'react';

interface NotificationBellProps {
  onOpenInbox?: (userId?: string) => void;
}

export const NotificationBell = ({ onOpenInbox }: NotificationBellProps = {}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    isLoading 
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    console.log('🔔 [NOTIFICATION CLICK]', {
      action_url: notification.action_url,
      type: notification.type,
      notification_id: notification.id,
    });

    // Marcar como lida (incluindo notificações agrupadas)
    if (!notification.is_read) {
      const idsToMark = notification.grouped_ids || [notification.id];
      await markAsRead(idsToMark);
    }

    // Se for notificação de mensagem e tiver callback de abrir inbox
    if (notification.type === 'new_message' && onOpenInbox) {
      const senderId = notification.actor_id || notification.data?.sender_id;
      setIsOpen(false); // Fechar dropdown
      onOpenInbox(senderId); // Abrir inbox com conversa selecionada
      return;
    }

    // Navegar e fazer scroll para o elemento se houver
    if (notification.action_url) {
      try {
        const url = new URL(notification.action_url, window.location.origin);
        const hash = url.hash;
        
        console.log('🚀 [NAVIGATION] Navegando para:', url.pathname);
        
        // CORREÇÃO: Fechar dropdown ANTES de navegar
        setIsOpen(false);
        
        // Usar setTimeout para garantir que o dropdown fechou
        setTimeout(() => {
          navigate(url.pathname, { state: { from: 'notification' } });
          
          // Aguardar navegação e fazer scroll
          if (hash) {
            setTimeout(() => {
              const element = document.querySelector(hash);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log('✅ [SCROLL] Elemento encontrado e scroll aplicado:', hash);
              } else {
                console.warn('⚠️ [SCROLL] Elemento não encontrado:', hash);
              }
            }, 300);
          }
        }, 100);
        
      } catch (error) {
        console.error('❌ [NAVIGATION ERROR]', error);
        // FALLBACK: Recarregar a página diretamente
        window.location.href = notification.action_url;
      }
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
      case 'community_post_liked':
        return '👍';
      
      // Networking
      case 'connection_request':
        return '👋';
      case 'connection_accepted':
        return '🎉';
      case 'new_message':
        return '💬';
      
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
                  "border-b border-border/50 hover:bg-surface-elevated/70 group",
                  !notification.is_read && "bg-aurora-primary/5"
                )}
              >
                {/* Avatar único ou stack */}
                {notification.grouped_count && notification.grouped_count > 1 ? (
                  <NotificationAvatarStack actors={notification.grouped_actors || []} />
                ) : notification.actor ? (
                  <NotificationAvatar actor={notification.actor} size="md" />
                ) : (
                  <span className="text-2xl mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                )}
                
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
                    
                    {/* Botões de ação (aparecem no hover) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-aurora-primary/10 hover:text-aurora-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.grouped_ids || [notification.id]);
                          }}
                          title="Marcar como lida"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-textSecondary hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="Deletar notificação"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
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
