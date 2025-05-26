
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  MoreHorizontal, 
  Flag, 
  Edit, 
  Trash2,
  Calendar 
} from 'lucide-react';
import { Post } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';
import { usePostInteractions } from '@/hooks/usePostInteractions';

interface ReplyItemProps {
  reply: Post;
  topicId: string;
  onReplyDeleted?: () => void;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({ 
  reply, 
  topicId, 
  onReplyDeleted 
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const { 
    canDelete, 
    isDeleting, 
    handleDeletePost 
  } = usePostInteractions({
    postId: reply.id,
    topicId,
    authorId: reply.user_id,
    onPostDeleted: onReplyDeleted
  });

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

  const isAuthor = user?.id === reply.user_id;
  const contentPreview = reply.content.length > 300 
    ? reply.content.substring(0, 300) + '...'
    : reply.content;

  return (
    <Card className={`${reply.is_solution ? 'border-green-200 bg-green-50/30' : ''} transition-colors hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Cabeçalho da resposta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={reply.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {getInitials(reply.profiles?.name || 'Usuário')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{reply.profiles?.name || 'Usuário'}</span>
                  {reply.profiles?.role === 'admin' && (
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  )}
                  {reply.is_solution && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Solução Aceita
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(reply.created_at)}
                </div>
              </div>
            </div>

            {/* Menu de ações */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!reply.is_solution && (
                    <DropdownMenuItem className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como solução
                    </DropdownMenuItem>
                  )}
                  {isAuthor && (
                    <DropdownMenuItem className="text-blue-600">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-yellow-600">
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar
                  </DropdownMenuItem>
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Conteúdo da resposta */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">
              {isExpanded || reply.content.length <= 300 ? reply.content : contentPreview}
            </div>
            {reply.content.length > 300 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto text-primary mt-2"
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
