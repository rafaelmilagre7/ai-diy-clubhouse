import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NotificationAvatar } from './NotificationAvatar';
import { NotificationAvatarStack } from './NotificationAvatarStack';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NotificationCardProps {
  notification: any;
  onMarkAsRead: (ids: string[]) => void;
  onDelete: (id: string) => void;
  index: number;
}

export const NotificationCard = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  index 
}: NotificationCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (!notification.is_read) {
      const idsToMark = notification.grouped_ids || [notification.id];
      onMarkAsRead(idsToMark);
    }
    
    if (notification.action_url) {
      const url = new URL(notification.action_url, window.location.origin);
      const hash = url.hash;
      
      navigate(url.pathname);
      
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  };
  
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      comment_liked: '👍',
      comment_replied: '💬',
      community_reply: '💬',
      community_mention: '👤',
      community_post_liked: '👍',
      new_course: '🎓',
      new_lesson: '📚',
      certificate_available: '🎖️',
      event_reminder_24h: '📅',
      event_reminder_1h: '⏰',
      ai_recommendation: '🤖',
      weekly_summary: '📊',
    };
    return icons[type] || '🔔';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div
        onClick={handleClick}
        className={cn(
          "flex items-start gap-3 p-4 rounded-lg border cursor-pointer",
          "transition-all duration-fast hover:shadow-md hover:border-aurora-primary/30",
          "group",
          !notification.is_read 
            ? "bg-aurora-primary/5 border-aurora-primary/20" 
            : "bg-card border-border hover:bg-surface-elevated/50"
        )}
      >
        {/* Avatar/Ícone */}
        <div className="flex-shrink-0">
          {notification.grouped_count && notification.grouped_count > 1 ? (
            <NotificationAvatarStack actors={notification.grouped_actors || []} />
          ) : notification.actor ? (
            <NotificationAvatar actor={notification.actor} size="md" />
          ) : (
            <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
          )}
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={cn(
              "text-sm font-medium leading-tight",
              !notification.is_read ? "text-textPrimary" : "text-textSecondary"
            )}>
              {notification.title}
              {notification.grouped_count && notification.grouped_count > 1 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-aurora-primary/20 text-aurora-primary">
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
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary/60">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
            
            {/* Ações (aparecem no hover) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-aurora-primary/10 hover:text-aurora-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.grouped_ids || [notification.id]);
                  }}
                  title="Marcar como lida"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-textSecondary hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                title="Deletar notificação"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
