
import { Comment } from '@/types/commentTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Trash2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOptimisticLike } from '@/hooks/comments/useOptimisticLike';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  toolId: string;
  onReply: () => void;
  onDelete: () => void;
  isReply?: boolean;
}

export const CommentItem = ({
  comment,
  currentUserId,
  toolId,
  onReply,
  onDelete,
  isReply = false
}: CommentItemProps) => {
  const isAuthor = currentUserId === comment.user_id;
  const isAdmin = comment.profiles?.role === 'admin';
  const hasLiked = comment.user_has_liked;
  
  // Hook otimista para likes
  const { likeComment, isProcessing } = useOptimisticLike({
    commentTable: 'tool_comments',
    likeTable: 'tool_comment_likes',
    queryKey: ['tool-comments', toolId]
  });

  const handleLike = () => {
    likeComment(comment.id, hasLiked, comment.likes_count);
  };
  
  // Função para formatar a data de criação
  const getFormattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return 'data inválida';
    }
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={cn(
      "rounded-lg p-4", 
      isReply 
        ? "bg-backgroundLight/70" 
        : "bg-card border border-border hover:border-border transition-colors"
    )}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border border-white/10">
          <AvatarImage 
            src={comment.profiles?.avatar_url || ''} 
            alt={comment.profiles?.name || 'Usuário'}
            className="object-cover"
          />
          <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary font-medium">
            {getInitials(comment.profiles?.name || 'Usuário')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-textPrimary">{comment.profiles?.name || 'Usuário'}</span>
            
            {isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-aurora-primary/10 text-aurora-primary">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
            )}
            
            <span className="text-xs text-textSecondary">
              {getFormattedDate(comment.created_at)}
            </span>
          </div>
          
          <div className="mt-2 whitespace-pre-line text-textPrimary">
            {comment.content}
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isProcessing(comment.id)}
              className={cn(
                "text-xs flex items-center gap-1 h-7 px-2 transition-all",
                "duration-fast ease-smooth",
                hasLiked 
                  ? "text-aurora-primary hover:text-aurora-primary/80 hover:bg-aurora-primary/10" 
                  : "text-textSecondary hover:text-textPrimary hover:bg-surface-elevated/50",
                isProcessing(comment.id) && "opacity-70 cursor-not-allowed"
              )}
              onClick={handleLike}
            >
              <ThumbsUp 
                className={cn(
                  "h-3.5 w-3.5 transition-all duration-fast",
                  hasLiked && "fill-current scale-110"
                )} 
              />
              <span className="transition-all duration-fast">
                {comment.likes_count > 0 ? comment.likes_count : ''} Curtir
              </span>
            </Button>
            
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center gap-1 h-7 px-2 text-textSecondary hover:text-textPrimary" 
                onClick={onReply}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Responder</span>
              </Button>
            )}
            
            {(isAuthor || isAdmin) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center gap-1 h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
