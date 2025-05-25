
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Reply, User } from 'lucide-react';
import { Post } from '@/types/forumTypes';
import { getInitials } from '@/utils/user';
import { ReplyForm } from './ReplyForm';

interface PostItemProps {
  post: Post;
  canMarkAsSolution: boolean;
  isAuthor: boolean;
  onMarkAsSolution: () => void;
  isMarkingSolved: boolean;
  topicId: string;
}

export const PostItem = ({
  post,
  canMarkAsSolution,
  isAuthor,
  onMarkAsSolution,
  isMarkingSolved,
  topicId
}: PostItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  return (
    <Card className={`${post.is_solution ? 'border-green-500 bg-green-50/50' : ''}`}>
      <CardContent className="p-6">
        {/* Header do Post */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {post.profiles?.name ? getInitials(post.profiles.name) : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {post.profiles?.name || 'Usuário Anônimo'}
                </span>
                {isAuthor && (
                  <Badge variant="outline" className="text-xs">Autor</Badge>
                )}
                {post.profiles?.role === 'admin' && (
                  <Badge variant="default" className="text-xs">Admin</Badge>
                )}
                {post.is_solution && (
                  <Badge className="bg-green-600 hover:bg-green-500 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Solução
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex items-center gap-2">
            {canMarkAsSolution && !post.is_solution && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAsSolution}
                disabled={isMarkingSolved}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {isMarkingSolved ? 'Marcando...' : 'Marcar como Solução'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Conteúdo */}
        <div className="prose prose-sm max-w-none mb-4">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        {/* Ações do Post */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <Reply className="h-4 w-4 mr-1" />
            Responder
          </Button>
        </div>
        
        {/* Formulário de Resposta */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t bg-muted/20 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Responder a {post.profiles?.name || 'Usuário'}</h4>
            <ReplyForm
              topicId={topicId}
              parentId={post.id}
              placeholder="Digite sua resposta..."
              buttonText="Enviar Resposta"
              onPostCreated={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
