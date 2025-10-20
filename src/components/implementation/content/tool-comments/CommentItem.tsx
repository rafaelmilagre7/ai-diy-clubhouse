
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, ThumbsUp, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';
import { useOptimisticLike } from '@/hooks/comments/useOptimisticLike';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  solutionId: string;
  moduleId: string;
  onReply: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export const CommentItem = ({ comment, solutionId, moduleId, onReply, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.user_id;
  
  // Hook otimista para likes
  const { likeComment, isProcessing } = useOptimisticLike({
    commentTable: 'solution_comments',
    likeTable: 'solution_comment_likes',
    queryKey: ['solution-comments', solutionId, moduleId]
  });

  const handleLike = () => {
    likeComment(comment.id, comment.user_has_liked || false, comment.likes_count || 0);
  };
  
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

  // Dados do perfil com fallbacks para casos onde o relacionamento falha
  const profileName = comment.profiles?.name || 'Usuário';
  const profileRole = comment.profiles?.role;
  const profileAvatarUrl = comment.profiles?.avatar_url;

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md hover:border-border transition-all duration-300">
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-aurora-primary/10">
            <AvatarImage 
              src={profileAvatarUrl} 
              alt={profileName}
              className="object-cover"
              onError={() => console.log('Erro ao carregar avatar:', profileAvatarUrl)}
            />
            <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary font-medium border border-aurora-primary/20">
              {getInitials(profileName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-textPrimary">{profileName}</span>
                  {profileRole === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-aurora-primary/10 text-aurora-primary">
                      <Shield className="h-3 w-3 mr-1" />
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-sm text-textSecondary">{formatDate(comment.created_at)}</p>
              </div>
              
              {isAuthor && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(comment)}
                  className="h-8 w-8 p-0 text-status-error hover:text-status-error/80 hover:bg-status-error/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="text-textPrimary leading-relaxed">
              {comment.content}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                disabled={isProcessing(comment.id)}
                onClick={handleLike}
                className={cn(
                  "text-xs transition-all duration-fast ease-smooth",
                  comment.user_has_liked 
                    ? 'text-aurora-primary hover:text-aurora-primary/80 hover:bg-aurora-primary/10' 
                    : 'text-textSecondary hover:text-textPrimary hover:bg-surface-elevated/50',
                  isProcessing(comment.id) && "opacity-70 cursor-not-allowed"
                )}
              >
                <ThumbsUp 
                  className={cn(
                    "h-3.5 w-3.5 mr-1 transition-all duration-fast",
                    comment.user_has_liked && "fill-current scale-110"
                  )} 
                />
                {comment.likes_count || 0}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onReply(comment)}
                className="text-xs text-textSecondary hover:text-textPrimary hover:bg-aurora-primary/10"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Responder
              </Button>
              
              {isAuthor && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(comment)}
                  className="text-xs text-status-error hover:text-status-error/80 hover:bg-status-error/10"
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
            
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4 mt-4 pl-6 border-l-2 border-aurora-primary/10">
                {comment.replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply}
                    solutionId={solutionId}
                    moduleId={moduleId}
                    onReply={onReply}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
