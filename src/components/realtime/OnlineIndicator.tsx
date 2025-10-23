import { cn } from '@/lib/utils';
import { useSimplePresence } from '@/hooks/realtime/useSimplePresence';

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
  showOffline?: boolean;
}

/**
 * Indicador de status online/offline
 * Fase 2: Bolinha verde/cinza no avatar
 */
export function OnlineIndicator({ 
  userId, 
  className,
  showOffline = true 
}: OnlineIndicatorProps) {
  const { isUserOnline } = useSimplePresence();
  const online = isUserOnline(userId);

  if (!online && !showOffline) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-full border-2 border-background',
        online ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
        className
      )}
      title={online ? 'Online' : 'Offline'}
    />
  );
}
