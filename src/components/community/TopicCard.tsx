
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Eye, Clock, Pin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Topic } from '@/types/forumTypes';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
}

export const TopicCard = ({ topic, isPinned = false }: TopicCardProps) => {
  const authorName = topic.profiles?.name || 'Usuário';
  const authorAvatar = topic.profiles?.avatar_url;
  const categoryName = topic.category?.name;
  const categoryIcon = topic.category?.icon;

  const timeAgo = formatDistanceToNow(new Date(topic.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Link to={`/comunidade/topico/${topic.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isPinned ? 'border-blue-200 bg-blue-50/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Avatar do autor */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={authorAvatar || undefined} />
              <AvatarFallback>
                {authorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0">
              {/* Título com badges */}
              <div className="flex items-start gap-2 mb-2">
                <h3 className="font-medium text-gray-900 leading-tight flex-1">
                  {isPinned && <Pin className="inline h-4 w-4 text-blue-600 mr-1" />}
                  {topic.is_solved && <CheckCircle className="inline h-4 w-4 text-green-600 mr-1" />}
                  {topic.title}
                </h3>
              </div>

              {/* Metadados */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  por <span className="font-medium">{authorName}</span>
                </span>
                
                {categoryName && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {categoryIcon && <span className="text-xs">{categoryIcon}</span>}
                    {categoryName}
                  </Badge>
                )}
                
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              </div>

              {/* Estatísticas */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {topic.reply_count} {topic.reply_count === 1 ? 'resposta' : 'respostas'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {topic.view_count} {topic.view_count === 1 ? 'visualização' : 'visualizações'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
