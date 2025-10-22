import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Props {
  actor?: {
    name: string;
    avatar_url?: string;
    company_name?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NotificationAvatar = ({ actor, size = 'md', className }: Props) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };
  
  if (!actor) return null;
  
  const initials = actor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  return (
    <Avatar className={cn(sizeClasses[size], 'ring-2 ring-background flex-shrink-0', className)}>
      <AvatarImage src={actor.avatar_url} alt={actor.name} />
      <AvatarFallback className="bg-gradient-to-br from-aurora-primary to-accent text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
