
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Loader2, User } from 'lucide-react';
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
  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => {
      console.log('Buscando comentários para sugestão:', suggestionId);
      
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner(name, avatar_url)
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar comentários:', error);
        throw error;
      }

      console.log('Comentários encontrados:', data);
      return data as Comment[] || [];
    },
    retry: 2
  });

  // Criar comentário
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Criando comentário:', { content, suggestionId, userId: user.id });

      const { data, error } = await supabase
        .from('suggestion_comments')
        .insert({
          content: content.trim(),
          suggestion_id: suggestionId,
          user_id: user.id
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner(name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar comentário:', error);
        throw error;
      }

      console.log('Comentário criado:', data);
      return data;
    },
    onSuccess: (newComment) => {
      // Atualizar cache local imediatamente
      queryClient.setQueryData(
        ['suggestion-comments', suggestionId], 
        (oldComments: Comment[] = []) => [newComment, ...oldComments]
      );
      
      // Invalidar para recarregar dados do servidor
      queryClient.invalidateQueries({ queryKey: ['suggestion-comments', suggestionId] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['suggestion', suggestionId] });
      
      setNewComment('');
      toast.success('Comentário adicionado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }
    createCommentMutation.mutate(newComment.trim());
  };

  if (error) {
    console.error('Erro na query de comentários:', error);
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulário para novo comentário */}
        {user ? (
          <Card className="bg-muted/50 border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-border">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.user_metadata?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Compartilhe sua opinião sobre esta sugestão..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="resize-none bg-background border-border focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="gap-2"
                  >
                    {createCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/30 border-dashed border-2 border-muted-foreground/20">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você precisa estar logado para comentar
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lista de comentários */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                        <div className="space-y-1">
                          <div className="h-3 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <Card className="bg-muted/20 border-dashed border-2 border-muted-foreground/20">
              <CardContent className="pt-8 pb-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">
                  Nenhum comentário ainda
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seja o primeiro a compartilhar sua opinião!
                </p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="bg-background border-border hover:bg-muted/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-border">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {comment.profiles?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {comment.profiles?.name || 'Usuário'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
