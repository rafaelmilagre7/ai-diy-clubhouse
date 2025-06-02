
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Trash2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeDate } from '@/utils/suggestionUtils';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  suggestion_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  is_official: boolean;
  profiles?: {
    name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface SuggestionCommentsProps {
  suggestionId: string;
}

export const SuggestionComments: React.FC<SuggestionCommentsProps> = ({ suggestionId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          *,
          profiles!suggestion_comments_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('suggestion_id', suggestionId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar replies para cada comentário
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('suggestion_comments')
            .select(`
              *,
              profiles!suggestion_comments_user_id_fkey (
                name,
                avatar_url
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );

      return commentsWithReplies;
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('suggestion_comments')
        .insert({
          content,
          suggestion_id: suggestionId,
          user_id: user.id,
          parent_id: parentId || null,
        })
        .select(`
          *,
          profiles!suggestion_comments_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestion-comments', suggestionId] });
      setNewComment('');
      setReplyContent('');
      setReplyTo(null);
      toast.success('Comentário adicionado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('suggestion_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestion-comments', suggestionId] });
      toast.success('Comentário removido');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover comentário: ${error.message}`);
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({ content: newComment });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    createCommentMutation.mutate({ content: replyContent, parentId });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const canDelete = user?.id === comment.user_id;
    const authorInitials = comment.profiles?.name
      ? comment.profiles.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';

    return (
      <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.profiles?.name || 'Usuário'}
              </span>
              {comment.is_official && (
                <Badge variant="secondary" className="text-xs">
                  Oficial
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(comment.created_at)}
              </span>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 mb-2">
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-foreground">
                <Heart className="h-3 w-3" />
                {comment.upvotes}
              </button>
              
              {!isReply && user && (
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="hover:text-foreground"
                >
                  Responder
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                  className="hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            
            {replyTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Escreva sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || createCommentMutation.isPending}
                  >
                    Responder
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Compartilhe sua opinião sobre esta sugestão..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Comentar
            </Button>
          </div>
        )}
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Seja o primeiro a comentar nesta sugestão!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
