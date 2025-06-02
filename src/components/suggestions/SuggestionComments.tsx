
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeDate } from '@/utils/suggestionUtils';

interface SuggestionCommentsProps {
  suggestionId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    avatar_url: string;
  } | null;
}

export const SuggestionComments: React.FC<SuggestionCommentsProps> = ({ 
  suggestionId 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

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
          profiles:user_id(name, avatar_url)
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Criar comentário
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('suggestion_comments')
        .insert({
          content,
          suggestion_id: suggestionId,
          user_id: user.id
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestion-comments', suggestionId] });
      setNewComment('');
      toast.success('Comentário adicionado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Formulário para novo comentário */}
        {user && (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </form>
        )}

        {/* Lista de comentários */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            </div>
          ) : (
            comments.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.profiles?.name || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
