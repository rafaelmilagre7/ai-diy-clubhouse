
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Eye, CheckCircle, Pin } from 'lucide-react';
import { Topic } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, isPinned = false }) => {
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isPinned ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={topic.profiles?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {getInitials(topic.profiles?.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link 
                to={`/comunidade/topico/${topic.id}`}
                className="font-medium hover:text-primary transition-colors line-clamp-2"
              >
                {topic.title}
              </Link>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {topic.is_pinned && (
                  <Pin className="h-4 w-4 text-yellow-600" />
                )}
                {topic.is_solved && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span>por {topic.profiles?.name || 'Usuário'}</span>
              <span>•</span>
              <span>{formatDate(topic.created_at)}</span>
              {topic.category && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {topic.category.name}
                  </Badge>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic.reply_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{topic.view_count || 0}</span>
              </div>
              
              {topic.last_activity_at && topic.last_activity_at !== topic.created_at && (
                <span className="ml-auto">
                  Última atividade {formatDate(topic.last_activity_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
