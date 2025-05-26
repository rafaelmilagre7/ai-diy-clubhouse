
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Eye, 
  Pin, 
  Lock, 
  CheckCircle,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import { Topic } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials, getUserDisplayRole } from '@/utils/user';
import { useAuth } from '@/contexts/auth';
import { ReplyForm } from './ReplyForm';
import { PostList } from './PostList';

interface TopicDetailViewProps {
  topic: Topic;
}

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({ topic }) => {
  const { user, isAdmin } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);

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

  const isAuthor = user?.id === topic.user_id;

  return (
    <div className="space-y-6">
      {/* Header do tópico */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Badges e meta informações */}
            <div className="flex items-center gap-2 flex-wrap">
              {topic.is_pinned && (
                <Badge variant="secondary">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
              {topic.is_solved && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}
              {topic.is_locked && (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
              {topic.category && (
                <Badge variant="outline">
                  {topic.category.name}
                </Badge>
              )}
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold">{topic.title}</h1>

            {/* Autor e meta dados */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={topic.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(topic.profiles?.name || 'Usuário')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{topic.profiles?.name || 'Usuário'}</div>
                  <div className="text-sm text-muted-foreground">
                    {getUserDisplayRole(topic.profiles?.role || 'member')} • {formatDate(topic.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {topic.view_count} visualizações
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {topic.reply_count} respostas
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{topic.content}</div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowReplyForm(!showReplyForm)}
                disabled={topic.is_locked}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Responder
              </Button>

              {(isAuthor || isAdmin) && (
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de posts/respostas */}
      <PostList topicId={topic.id} />

      {/* Formulário de resposta */}
      {showReplyForm && !topic.is_locked && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Sua resposta</h3>
            <ReplyForm 
              topicId={topic.id} 
              onSuccess={() => setShowReplyForm(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
