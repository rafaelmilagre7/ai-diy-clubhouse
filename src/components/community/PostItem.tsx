
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MoreHorizontal } from 'lucide-react';
import { Post } from '@/types/forumTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostItemProps {
  post: Post;
  canMarkAsSolution: boolean;
  isAuthor: boolean;
  onMarkAsSolution: () => void;
  isMarkingSolved: boolean;
  topicId: string;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  canMarkAsSolution,
  isAuthor,
  onMarkAsSolution,
  isMarkingSolved,
  topicId
}) => {
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
    <Card className={post.is_solution ? 'border-green-200 bg-green-50/30' : ''}>
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
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
                {post.is_solution && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Solução
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(post.created_at)}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none mb-4">
              <div className="whitespace-pre-wrap">{post.content}</div>
            </div>
            
            {canMarkAsSolution && !post.is_solution && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAsSolution}
                  disabled={isMarkingSolved}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isMarkingSolved ? 'Marcando...' : 'Marcar como solução'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
