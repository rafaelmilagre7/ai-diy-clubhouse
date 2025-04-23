
import React from 'react';
import { useSolutionComments } from '@/hooks/implementation/useSolutionComments';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Reply, Heart, Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/utils/date';
import { Comment } from '@/types/commentTypes';

interface CommentsSectionProps {
  solutionId: string;
  moduleId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  solutionId,
  moduleId
}) => {
  const { 
    comments, 
    isLoading, 
    comment, 
    setComment,
    replyTo,
    setReplyTo,
    isSubmitting,
    handleSubmitComment,
    likeComment,
    deleteComment
  } = useSolutionComments(solutionId, moduleId);
  
  const { user, profile } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const topLevelComments = comments.filter(c => !c.parent_id);
  const isAdmin = profile?.role === 'admin';

  // Renderizar comentários de forma recursiva
  const renderComments = (parentComments: Comment[], level = 0) => {
    return parentComments.map((parentComment) => {
      const childComments = comments.filter(c => c.parent_id === parentComment.id);

      return (
        <div 
          key={parentComment.id} 
          className={cn(
            "pt-4",
            level > 0 ? "ml-8 border-l-2 pl-4 border-muted" : ""
          )}
        >
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={parentComment.user?.avatar_url || parentComment.profiles?.avatar_url} />
              <AvatarFallback>
                {(parentComment.user?.name || parentComment.profiles?.name || '?').charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{parentComment.user?.name || parentComment.profiles?.name || 'Usuário'}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatTimeAgo(parentComment.created_at)}</span>
                </div>
                
                {/* Menu de ações */}
                <div className="flex items-center gap-1">
                  {(user?.id === parentComment.user_id || isAdmin) && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-1"
                      onClick={() => deleteComment(parentComment)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-sm">{parentComment.content}</div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2 text-xs gap-1 text-muted-foreground"
                  onClick={() => likeComment(parentComment)}
                >
                  <Heart 
                    className={cn(
                      "h-3.5 w-3.5",
                      parentComment.user_has_liked ? "fill-red-500 text-red-500" : ""
                    )} 
                  />
                  <span>{parentComment.likes_count || 0}</span>
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2 text-xs gap-1 text-muted-foreground"
                  onClick={() => setReplyTo(parentComment)}
                >
                  <Reply className="h-3.5 w-3.5" />
                  <span>Responder</span>
                </Button>
              </div>
              
              {/* Renderizar respostas recursivamente */}
              {childComments.length > 0 && (
                <div className="pt-2 mt-2">
                  {renderComments(childComments, level + 1)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        {replyTo ? (
          <div className="mb-2 p-2 bg-muted/50 rounded-md">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Respondendo a <span className="font-medium">{replyTo.profiles?.name || replyTo.user?.name || 'Usuário'}</span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-5 w-5 p-0"
                onClick={() => setReplyTo(null)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs line-clamp-1 mt-1">{replyTo.content}</div>
          </div>
        ) : null}
        
        <form 
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitComment();
          }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Adicione um comentário..."
              className="flex-1 resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={1}
            />
            
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="divide-y">
            {renderComments(topLevelComments)}
          </div>
        )}
      </div>
    </div>
  );
};
