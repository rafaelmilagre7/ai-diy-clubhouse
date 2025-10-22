import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/realtime/usePresence';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OnlineIndicatorProps {
  userId: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OnlineIndicator({ 
  userId, 
  showTooltip = true, 
  size = 'md',
  className 
}: OnlineIndicatorProps) {
  const { isUserOnline, getUserLastSeen } = usePresence();
  
  const isOnline = isUserOnline(userId);
  const lastSeen = getUserLastSeen(userId);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const indicator = (
    <div
      className={cn(
        'rounded-full border-2 border-background',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        sizeClasses[size],
        className
      )}
    />
  );

  if (!showTooltip) {
    return indicator;
  }

  const getTooltipText = () => {
    if (isOnline) {
      return 'Online agora';
    }
    
    if (lastSeen) {
      return `Visto ${formatDistanceToNow(lastSeen, {
        addSuffix: true,
        locale: ptBR,
      })}`;
    }
    
    return 'Offline';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
