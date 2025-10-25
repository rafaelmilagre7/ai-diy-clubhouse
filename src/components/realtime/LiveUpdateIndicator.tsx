import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useSimplePresence } from '@/hooks/realtime/useSimplePresence';
import { cn } from '@/lib/utils';

interface LiveUpdateIndicatorProps {
  className?: string;
  showIcon?: boolean;
}

/**
 * Indicador de atividade ao vivo
 * Fase 4: Badge "X pessoas online"
 */
export function LiveUpdateIndicator({ 
  className,
  showIcon = true 
}: LiveUpdateIndicatorProps) {
  const { getOnlineCount, isConnected } = useSimplePresence();
  const count = getOnlineCount();

  if (!isConnected || count === 0) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'flex items-center gap-1.5 animate-in fade-in-50',
        className
      )}
    >
      {showIcon && <Users className="h-3 w-3" />}
      <span className="text-xs">
        {count} online
      </span>
      <div className="w-1.5 h-1.5 bg-system-healthy rounded-full animate-pulse" />
    </Badge>
  );
}
