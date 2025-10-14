import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isOwnMessage,
  senderName,
  senderAvatar
}) => {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn(
      "flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-2",
      isOwnMessage ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 ring-2 ring-background">
        <AvatarImage src={senderAvatar} alt={senderName} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
          {getInitials(senderName)}
        </AvatarFallback>
      </Avatar>

      {/* Conteúdo da mensagem */}
      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 backdrop-blur-sm transition-all duration-200",
          "border border-border/50 shadow-sm",
          isOwnMessage 
            ? "bg-primary/10 text-primary-foreground rounded-tr-sm" 
            : "bg-muted/50 text-foreground rounded-tl-sm",
          "group-hover:shadow-md group-hover:scale-[1.01]"
        )}>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {content}
          </p>
        </div>
        
        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatDistanceToNow(new Date(timestamp), { 
            addSuffix: true,
            locale: ptBR 
          })}
        </span>
      </div>
    </div>
  );
};
