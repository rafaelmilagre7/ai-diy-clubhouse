
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, ThumbsUp, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export const CommentItem = ({ comment, onReply, onLike, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const isCommentAuthor = user?.id === comment.user_id;
  const userName = comment.profile?.name || 'Usuário';
  const createdAt = new Date(comment.created_at);
  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true, 
    locale: ptBR 
  });
  
  // Obter as iniciais do nome do usuário para o fallback do avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profile?.avatar_url || ''} alt={userName} />
        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {userName}
            {comment.profile?.role === 'admin' && (
              <span className="ml-1 text-xs bg-[#0ABAB5] text-white px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <p className="text-sm whitespace-pre-line">{comment.content}</p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 text-xs gap-1"
            onClick={() => onLike(comment)}
          >
            <ThumbsUp 
              className={`h-3.5 w-3.5 ${comment.user_has_liked ? 'text-[#0ABAB5] fill-[#0ABAB5]' : ''}`} 
            />
            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 text-xs gap-1"
            onClick={() => onReply(comment)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Responder</span>
          </Button>
          
          {isCommentAuthor && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-1 text-xs gap-1 text-destructive"
              onClick={() => onDelete(comment)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </Button>
          )}
        </div>
        
        {/* Respostas ao comentário */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-3 border-l-2 border-muted space-y-3">
            {comment.replies.map((reply) => (
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
  );
};
