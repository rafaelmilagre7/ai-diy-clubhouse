import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LiveUpdateIndicatorProps {
  isConnected: boolean;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LiveUpdateIndicator({
  isConnected,
  label = 'Ao vivo',
  showLabel = true,
  size = 'md',
  className,
}: LiveUpdateIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (!showLabel) {
    return (
      <motion.div
        className={cn(
          'rounded-full',
          isConnected ? 'bg-green-500' : 'bg-gray-400',
          sizeClasses[size],
          className
        )}
        animate={{
          scale: isConnected ? [1, 1.2, 1] : 1,
          opacity: isConnected ? [1, 0.7, 1] : 0.5,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  return (
    <Badge
      variant={isConnected ? 'default' : 'secondary'}
      className={cn('gap-2', textSizeClasses[size], className)}
    >
      <motion.div
        className={cn(
          'rounded-full',
          isConnected ? 'bg-white' : 'bg-gray-400',
          sizeClasses[size]
        )}
        animate={{
          scale: isConnected ? [1, 1.3, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {label}
    </Badge>
  );
}
