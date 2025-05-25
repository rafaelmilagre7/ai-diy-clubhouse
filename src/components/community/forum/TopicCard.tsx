
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Eye, CheckCircle, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Topic } from '@/types/forumTypes';
import { Link } from 'react-router-dom';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
}

export const TopicCard = ({ topic, isPinned }: TopicCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(topic.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  const lastActivity = formatDistanceToNow(new Date(topic.last_activity_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${isPinned ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <Link to={`/comunidade/topico/${topic.id}`} className="block">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isPinned && <Pin className="h-4 w-4 text-primary" />}
                {topic.is_solved && <CheckCircle className="h-4 w-4 text-green-500" />}
                <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
                  {topic.title}
                </h3>
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {topic.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{topic.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{topic.reply_count}</span>
                </div>
                {topic.category && (
                  <Badge variant="secondary" className="text-xs">
                    {topic.category.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right min-w-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={topic.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {topic.profiles?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="font-medium">{topic.profiles?.name || 'Usuário'}</p>
                  <p className="text-muted-foreground">{timeAgo}</p>
                </div>
              </div>
              
              {topic.last_activity_at !== topic.created_at && (
                <div className="text-xs text-muted-foreground">
                  Última atividade: {lastActivity}
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};
