
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, Flag, Edit, Trash2 } from 'lucide-react';
import { Post } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { getInitials, getUserDisplayRole } from '@/utils/user';

interface PostItemProps {
  post: Post;
  topicId: string;
  canMarkAsSolution?: boolean;
  isAuthor?: boolean;
  onMarkAsSolution?: () => void;
  isMarkingSolved?: boolean;
  onPostDeleted?: () => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  topicId,
  canMarkAsSolution = false,
  isAuthor = false,
  onMarkAsSolution,
  isMarkingSolved = false,
  onPostDeleted
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const { handleDeletePost, isDeleting } = usePostInteractions({
    postId: post.id,
    topicId,
    authorId: post.user_id,
    onPostDeleted
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

  const isPostAuthor = user?.id === post.user_id;
  const contentPreview = post.content.length > 300 
    ? post.content.substring(0, 300) + '...'
    : post.content;

  return (
    <Card className={`${post.is_solution ? 'border-green-200 bg-green-50/30' : ''} transition-colors hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={post.profiles?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {getInitials(post.profiles?.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.profiles?.name || 'Usuário'}</span>
                {post.profiles?.role === 'admin' && (
                  <Badge variant="secondary" className="text-xs">
                    {getUserDisplayRole(post.profiles.role)}
                  </Badge>
                )}
                {post.is_solution && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Solução Aceita
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(post.created_at)}</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canMarkAsSolution && !post.is_solution && onMarkAsSolution && (
                      <DropdownMenuItem 
                        onClick={onMarkAsSolution}
                        disabled={isMarkingSolved}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isMarkingSolved ? 'Marcando...' : 'Marcar como solução'}
                      </DropdownMenuItem>
                    )}
                    {isPostAuthor && (
                      <DropdownMenuItem className="text-blue-600">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {(isPostAuthor || user?.id) && (
                      <DropdownMenuItem className="text-red-600">
                        <Flag className="h-4 w-4 mr-2" />
                        Reportar
                      </DropdownMenuItem>
                    )}
                    {isPostAuthor && (
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
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none mb-4">
              <div className="whitespace-pre-wrap">
                {isExpanded || post.content.length <= 300 ? post.content : contentPreview}
              </div>
              {post.content.length > 300 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0 h-auto text-primary"
                >
                  {isExpanded ? 'Ver menos' : 'Ver mais'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
