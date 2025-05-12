
import { Comment } from '@/types/commentTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Trash2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: () => void;
  onLike: () => void;
  onDelete: () => void;
  isReply?: boolean;
}

export const CommentItem = ({
  comment,
  currentUserId,
  onReply,
  onLike,
  onDelete,
  isReply = false
}: CommentItemProps) => {
  const isAuthor = currentUserId === comment.user_id;
  const isAdmin = comment.profiles?.role === 'admin';
  const hasLiked = comment.user_has_liked;
  
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
        : "bg-[#151823] border border-white/10 hover:border-white/20 transition-colors"
    )}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          {comment.profiles?.avatar_url ? (
            <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles?.name || 'Usuário'} />
          ) : (
            <AvatarFallback className="bg-viverblue/10 text-viverblue">
              {getInitials(comment.profiles?.name || 'Usuário')}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-textPrimary">{comment.profiles?.name || 'Usuário'}</span>
            
            {isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-viverblue/10 text-viverblue">
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
              className={cn(
                "text-xs flex items-center gap-1 h-7 px-2 text-textSecondary hover:text-textPrimary",
                hasLiked && "text-viverblue hover:text-viverblue/80"
              )} 
              onClick={onLike}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{comment.likes_count > 0 ? comment.likes_count : ''} Curtir</span>
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
