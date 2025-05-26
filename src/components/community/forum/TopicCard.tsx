
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Eye, Clock, Pin, Lock, CheckCircle } from 'lucide-react';
import { Topic } from '@/types/forumTypes';
import { getInitials, getUserDisplayRole } from '@/utils/user';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, isPinned = false }) => {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      isPinned && "border-yellow-200 bg-yellow-50/50",
      topic.is_solved && "border-green-200 bg-green-50/50"
    )}>
      <CardContent className="p-4">
        <Link to={`/comunidade/topico/${topic.id}`} className="block">
          <div className="space-y-3">
            {/* Header com badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {topic.is_pinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="h-3 w-3 mr-1" />
                    Fixado
                  </Badge>
                )}
                {topic.is_solved && (
                  <Badge className="text-xs bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolvido
                  </Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
                {topic.category && (
                  <Badge variant="outline" className="text-xs">
                    {topic.category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Título */}
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                {topic.title}
              </h3>
            </div>

            {/* Conteúdo preview */}
            <div>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {topic.content}
              </p>
            </div>

            {/* Footer com autor e estatísticas */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {/* Autor */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(topic.profiles?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">
                    {topic.profiles?.name || 'Usuário'}
                  </span>
                  {topic.profiles?.role && (
                    <span className="ml-1">
                      • {getUserDisplayRole(topic.profiles.role)}
                    </span>
                  )}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{topic.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{topic.reply_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(topic.last_activity_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};
