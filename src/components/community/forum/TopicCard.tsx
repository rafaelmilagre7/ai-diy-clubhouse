
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Eye, 
  Clock, 
  CheckCircle, 
  Pin,
  Lock 
} from 'lucide-react';
import { Topic } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, isPinned = false }) => {
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

  const contentPreview = topic.content.length > 150 
    ? topic.content.substring(0, 150) + '...'
    : topic.content;

  return (
    <Card className={`transition-all hover:shadow-md ${isPinned ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {topic.is_pinned && (
                  <Pin className="h-4 w-4 text-blue-600" />
                )}
                {topic.is_locked && (
                  <Lock className="h-4 w-4 text-red-600" />
                )}
                <Link 
                  to={`/comunidade/topico/${topic.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                  {topic.title}
                </Link>
              </div>
              
              {topic.category && (
                <Badge variant="outline" className="w-fit">
                  {topic.category.name}
                </Badge>
              )}
            </div>

            {topic.is_solved && (
              <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Resolvido
              </Badge>
            )}
          </div>

          {/* Prévia do conteúdo */}
          <p className="text-muted-foreground text-sm line-clamp-2">
            {contentPreview}
          </p>

          {/* Rodapé */}
          <div className="flex items-center justify-between">
            {/* Informações do autor */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={topic.profiles?.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {getInitials(topic.profiles?.name || 'Usuário')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {topic.profiles?.name || 'Usuário'}
              </span>
              {topic.profiles?.role === 'admin' && (
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              )}
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{topic.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic.reply_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(topic.last_activity_at || topic.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
