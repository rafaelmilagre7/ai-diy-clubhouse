
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export const CommentItem = ({ comment, onReply, onLike, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.user_id;
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return 'data desconhecida';
    }
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.name || 'Usuário'} />
          <AvatarFallback>{getInitials(comment.profiles?.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div>
              <span className="font-medium">{comment.profiles?.name || 'Usuário'}</span>
              <span className="text-muted-foreground text-sm ml-2">{formatDate(comment.created_at)}</span>
              {comment.profiles?.role === 'admin' && (
                <span className="bg-[#0ABAB5]/10 text-[#0ABAB5] text-xs px-2 py-0.5 rounded ml-2">
                  ADMIN
                </span>
              )}
            </div>
            
            {isAuthor && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(comment)}
                className="h-8 w-8 p-0"
              >
                <Trash className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          
          <div className="text-sm">
            {comment.content}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onLike(comment)}
              className={`text-xs ${comment.user_has_liked ? 'text-[#0ABAB5]' : 'text-muted-foreground'}`}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              {comment.likes_count || 0}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onReply(comment)}
              className="text-xs text-muted-foreground"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Responder
            </Button>
          </div>
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 mt-4 pl-6 border-l-2 border-muted">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  onReply={onReply} 
                  onLike={onLike} 
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
