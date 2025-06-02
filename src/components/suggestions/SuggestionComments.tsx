
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useCommentForm } from '@/hooks/suggestions/useCommentForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send } from 'lucide-react';
import { formatRelativeDate } from '@/utils/suggestionUtils';

interface SuggestionCommentsProps {
  suggestionId: string;
}

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    avatar_url: string;
  } | null;
}

const SuggestionComments: React.FC<SuggestionCommentsProps> = ({ suggestionId }) => {
  const { user } = useAuth();
  const {
    comment,
    isSubmitting,
    handleCommentChange,
    handleSubmitComment
  } = useCommentForm('suggestion', suggestionId);

  // Buscar comentários
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar comentários:', error);
        throw error;
      }

      // Transformar dados para garantir que profiles seja um objeto único
      const transformedComments: CommentData[] = (data || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        profiles: Array.isArray(comment.profiles) 
          ? comment.profiles[0] || null 
          : comment.profiles
      }));

      return transformedComments;
    },
    enabled: !!suggestionId
  });

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MessageSquare className="h-5 w-5" />
            Comentários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageSquare className="h-5 w-5" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulário de novo comentário */}
        {user && (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Adicione seu comentário..."
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!comment.trim() || isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </form>
        )}

        {/* Lista de comentários */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum comentário ainda.</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                <Avatar className="h-10 w-10 ring-2 ring-border">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {comment.profiles?.name || 'Usuário'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeDate(comment.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionComments;
