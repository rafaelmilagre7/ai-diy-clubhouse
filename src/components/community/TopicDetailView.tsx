
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  MessageSquare, 
  Eye, 
  Calendar,
  Pin,
  Lock
} from 'lucide-react';
import { Topic } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';
import { TopicRepliesList } from './TopicRepliesList';
import { CreateReplyForm } from './CreateReplyForm';
import { useAuth } from '@/contexts/auth';

interface TopicDetailViewProps {
  topic: Topic;
}

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({ topic }) => {
  const { user } = useAuth();
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
      {/* Cabeçalho do Tópico */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Título e badges */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <h1 className="text-2xl font-bold flex-1">{topic.title}</h1>
                <div className="flex gap-2">
                  {topic.is_pinned && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      Fixado
                    </Badge>
                  )}
                  {topic.is_locked && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Bloqueado
                    </Badge>
                  )}
                  {topic.is_solved && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Resolvido
                    </Badge>
                  )}
                </div>
              </div>

              {/* Categoria */}
              {topic.category && (
                <Badge variant="outline">{topic.category.name}</Badge>
              )}
            </div>

            {/* Informações do autor e estatísticas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={topic.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(topic.profiles?.name || 'Usuário')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{topic.profiles?.name || 'Usuário'}</span>
                    {topic.profiles?.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(topic.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{topic.view_count} visualizações</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{topic.reply_count} respostas</span>
                </div>
              </div>
            </div>

            {/* Conteúdo do tópico */}
            <div className="prose prose-sm max-w-none pt-4 border-t">
              <div className="whitespace-pre-wrap">{topic.content}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Respostas */}
      <TopicRepliesList topicId={topic.id} />

      {/* Formulário de Resposta */}
      {user && !topic.is_locked && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Sua Resposta</h3>
                {!showReplyForm && (
                  <Button onClick={() => setShowReplyForm(true)}>
                    Responder
                  </Button>
                )}
              </div>
              
              {showReplyForm && (
                <CreateReplyForm 
                  topicId={topic.id}
                  onSuccess={() => setShowReplyForm(false)}
                  onCancel={() => setShowReplyForm(false)}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem para usuários não logados */}
      {!user && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Faça login para participar da discussão e responder a este tópico.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mensagem para tópicos bloqueados */}
      {topic.is_locked && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <Lock className="h-4 w-4" />
              <span>Este tópico foi bloqueado e não aceita mais respostas.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
