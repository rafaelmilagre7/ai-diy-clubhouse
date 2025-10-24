import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface MemberAvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base'
};

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'md' }) => {
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={cn(sizeClasses[size], "border-2 border-background cursor-pointer")}>
            {member.avatar_url ? (
              <AvatarImage src={member.avatar_url} alt={member.name} />
            ) : (
              <AvatarFallback className="bg-gradient-aurora text-white font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface MemberAvatarGroupProps {
  members: Member[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MemberAvatarGroup: React.FC<MemberAvatarGroupProps> = ({ 
  members, 
  maxDisplay = 3,
  size = 'md' 
}) => {
  const displayMembers = members.slice(0, maxDisplay);
  const remaining = members.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayMembers.map(member => (
        <MemberAvatar key={member.id} member={member} size={size} />
      ))}
      {remaining > 0 && (
        <Avatar className={cn(sizeClasses[size], "border-2 border-background")}>
          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
            +{remaining}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
