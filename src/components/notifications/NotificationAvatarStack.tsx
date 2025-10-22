import { NotificationAvatar } from './NotificationAvatar';

interface Actor {
  name: string;
  avatar_url?: string;
  company_name?: string;
}

interface Props {
  actors: Actor[];
  maxVisible?: number;
}

export const NotificationAvatarStack = ({ actors, maxVisible = 3 }: Props) => {
  if (!actors || actors.length === 0) return null;
  
  const visibleActors = actors.slice(0, maxVisible);
  const remaining = actors.length - maxVisible;
  
  return (
    <div className="flex -space-x-2">
      {visibleActors.map((actor, i) => (
        <div 
          key={i} 
          style={{ zIndex: 10 - i }}
          className="transition-transform hover:scale-110"
        >
          <NotificationAvatar actor={actor} size="sm" />
        </div>
      ))}
      {remaining > 0 && (
        <div 
          className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold text-textSecondary" 
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
