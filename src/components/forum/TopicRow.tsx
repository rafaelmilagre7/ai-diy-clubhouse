
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForumTopicWithMeta } from '@/lib/supabase/types/forum.types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Pin as PinIcon, Lock as LockIcon } from 'lucide-react';

interface TopicRowProps {
  topic: ForumTopicWithMeta;
}

export const TopicRow = ({ topic }: TopicRowProps) => {
  // Obter as iniciais do nome do autor para o avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const relativeTime = formatDistanceToNow(new Date(topic.last_activity_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className="transition-all hover:bg-accent/10">
      <Link to={`/forum/topico/${topic.id}`} className="block">
        <CardContent className="p-4 grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-9 space-y-1">
            <div className="flex items-center space-x-2">
              {topic.is_pinned && (
                <PinIcon className="h-4 w-4 text-amber-500" aria-label="Fixado" />
              )}
              {topic.is_locked && (
                <LockIcon className="h-4 w-4 text-red-500" aria-label="Bloqueado" />
              )}
              <h3 className="text-lg font-semibold line-clamp-1">{topic.title}</h3>
            </div>
            
            <div className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
              {topic.content.replace(/<[^>]*>?/gm, '')}
            </div>
            
            {topic.category && (
              <Badge variant="outline" className="text-xs">
                {topic.category.name}
              </Badge>
            )}
          </div>
          
          <div className="col-span-12 md:col-span-3 flex justify-between items-center md:justify-end space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{topic.reply_count}</span>
            </div>
            
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={topic.author?.avatar_url || undefined} />
                <AvatarFallback>{getInitials(topic.author?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium truncate max-w-[100px]">
                  {topic.author?.name || 'Anônimo'}
                </span>
                <span className="text-xs text-muted-foreground">{relativeTime}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
