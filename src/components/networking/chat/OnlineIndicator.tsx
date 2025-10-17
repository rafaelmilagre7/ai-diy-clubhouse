import { useUserPresence } from '@/hooks/networking/useUserPresence';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
}

export const OnlineIndicator = ({ userId, className }: OnlineIndicatorProps) => {
  const presence = useUserPresence(userId);

  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
        presence.isOnline ? 'bg-system-healthy' : 'bg-muted',
        className
      )}
      title={
        presence.isOnline
          ? 'Online'
          : presence.lastSeen
          ? `Visto ${formatDistanceToNow(presence.lastSeen, {
              addSuffix: true,
              locale: ptBR,
            })}`
          : 'Offline'
      }
    />
  );
};
