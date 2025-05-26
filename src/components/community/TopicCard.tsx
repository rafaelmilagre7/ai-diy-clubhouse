
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye, Clock, Pin, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Topic } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';

interface TopicCardProps {
  topic: Topic;
  isPinned?: boolean;
  showCategory?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  isPinned = false,
  showCategory = true 
}) => {
  const authorName = topic.profiles?.name || 'Usuário';
  const categoryName = topic.category?.name || 'Geral';
  
  const timeAgo = formatDistanceToNow(new Date(topic.last_activity_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${isPinned ? 'border-blue-200 bg-blue-50/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
          </Avatar>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <Link 
                  to={`/comunidade/topico/${topic.id}`}
                  className="block hover:text-blue-600 transition-colors"
                >
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                    {isPinned && <Pin className="inline h-4 w-4 text-blue-600 mr-1" />}
                    {topic.is_locked && <Lock className="inline h-4 w-4 text-gray-600 mr-1" />}
                    {topic.title}
                    {topic.is_solved && <CheckCircle className="inline h-4 w-4 text-green-600 ml-1" />}
                  </h3>
                </Link>
                
                {/* Resumo do conteúdo */}
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {topic.content.substring(0, 120)}...
                </p>
              </div>

              {/* Status badges */}
              <div className="flex flex-col items-end gap-1">
                {topic.is_solved && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Resolvido
                  </Badge>
                )}
                {showCategory && topic.category && (
                  <Badge variant="secondary" className="text-xs">
                    {categoryName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Meta informações */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {topic.reply_count}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {topic.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeAgo}
                </span>
              </div>

              <div className="text-right">
                <p className="font-medium">{authorName}</p>
                {topic.profiles?.role === 'admin' && (
                  <Badge variant="outline" className="text-xs">
                    Admin
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
