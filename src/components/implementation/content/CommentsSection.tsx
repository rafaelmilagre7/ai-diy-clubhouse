
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, ThumbsUp, Trash2, Reply } from 'lucide-react';
import { Comment } from '@/types/commentTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onLikeComment: (comment: Comment) => void;
  onDeleteComment: (comment: Comment) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  isLoading = false,
  isSubmitting = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { user, isAdmin } = useSimpleAuth();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await onAddComment(newComment);
    setNewComment('');
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    await onAddComment(replyContent, parentId);
    setReplyContent('');
    setReplyTo(null);
  };

  const canDeleteComment = (comment: Comment) => {
    return isAdmin || (user && user.id === comment.user_id);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>
            {comment.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.profiles?.name || 'Usuário'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
          
          <p className="text-sm text-foreground mb-2">{comment.content}</p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikeComment(comment)}
              className="h-8 px-2"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.likes_count || 0}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="h-8 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Responder
              </Button>
            )}
            
            {canDeleteComment(comment) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteComment(comment)}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {replyTo === comment.id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2"
                rows={2}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  <Send className="h-3 w-3 mr-1" />
                  Responder
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para novo comentário */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Compartilhe suas dúvidas ou experiências..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Comentar'}
          </Button>
        </form>

        {/* Lista de comentários */}
        <div className="space-y-4 pt-4 border-t">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Carregando comentários...</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Seja o primeiro a comentar! Compartilhe suas dúvidas ou experiências.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
