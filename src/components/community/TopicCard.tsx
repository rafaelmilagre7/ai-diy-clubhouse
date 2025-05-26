
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Eye, 
  Clock, 
  Pin, 
  Lock, 
  CheckCircle,
  MoreHorizontal 
} from 'lucide-react';
import { Topic } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
  showCategory?: boolean;
}

export const TopicCard = ({ topic, isPinned = false, showCategory = true }: TopicCardProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isPinned ? 'border-blue-200 bg-blue-50/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar do Autor */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage 
              src={topic.profiles?.avatar_url || undefined} 
              alt={topic.profiles?.name || 'Usuário'} 
            />
            <AvatarFallback>
              {getInitials(topic.profiles?.name)}
            </AvatarFallback>
          </Avatar>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {topic.is_pinned && (
                    <Pin className="h-4 w-4 text-blue-500" />
                  )}
                  {topic.is_locked && (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                  {topic.is_solved && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <Link 
                    to={`/comunidade/topico/${topic.id}`}
                    className="font-medium text-lg hover:text-primary transition-colors line-clamp-2"
                  >
                    {topic.title}
                  </Link>
                </div>

                {/* Informações do Autor e Data */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>por {topic.profiles?.name || 'Usuário Anônimo'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(topic.created_at)}
                  </span>
                  {showCategory && topic.category && (
                    <>
                      <span>•</span>
                      <Link 
                        to={`/comunidade/categoria/${topic.category.slug}`}
                        className="hover:text-primary"
                      >
                        {topic.category.name}
                      </Link>
                    </>
                  )}
                </div>

                {/* Preview do Conteúdo */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {topic.content?.substring(0, 200)}
                  {topic.content && topic.content.length > 200 && '...'}
                </p>
              </div>

              {/* Menu de Ações */}
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Estatísticas e Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {topic.reply_count || 0} resposta{(topic.reply_count || 0) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {topic.view_count || 0} visualizações
                </span>
              </div>

              {/* Badges de Status */}
              <div className="flex items-center gap-2">
                {topic.is_solved && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Resolvido
                  </Badge>
                )}
                {topic.is_pinned && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Fixado
                  </Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    Fechado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
