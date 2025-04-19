
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Suggestion, SuggestionComment } from '@/types/suggestionTypes';
import { useToast } from '@/hooks/use-toast';

const statusMap = {
  new: { label: 'Nova', color: 'bg-blue-500' },
  under_review: { label: 'Em análise', color: 'bg-orange-500' },
  approved: { label: 'Aprovada', color: 'bg-green-500' },
  in_development: { label: 'Em desenvolvimento', color: 'bg-purple-500' },
  implemented: { label: 'Implementada', color: 'bg-emerald-500' },
  rejected: { label: 'Rejeitada', color: 'bg-red-500' },
};

const SuggestionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: suggestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestion', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da sugestão não fornecido');
      
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          category:category_id(name),
          user:user_id(id, email, name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Suggestion & { 
        category: { name: string },
        user: { id: string, email: string, name: string, avatar_url: string }
      };
    },
  });

  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['suggestion-comments', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          *,
          user:user_id(id, email, name, avatar_url)
        `)
        .eq('suggestion_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (SuggestionComment & {
        user: { id: string, email: string, name: string, avatar_url: string }
      })[];
    },
  });

  const {
    data: userVote,
    isLoading: voteLoading
  } = useQuery({
    queryKey: ['suggestion-vote', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('*')
        .eq('suggestion_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Erro ao votar",
        description: "Você precisa estar logado para votar.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Se já votou com o mesmo tipo, remove o voto
      if (userVote && userVote.vote_type === voteType) {
        await supabase
          .from('suggestion_votes')
          .delete()
          .eq('id', userVote.id);
      } else {
        // Se não votou ou votou com tipo diferente, insere/atualiza
        await supabase
          .from('suggestion_votes')
          .upsert({
            suggestion_id: id,
            user_id: user.id,
            vote_type: voteType
          }, {
            onConflict: 'suggestion_id,user_id'
          });
      }

      // Refetch suggestion to update vote counts
      refetch();
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast({
        title: "Erro ao votar",
        description: error.message || "Ocorreu um erro ao registrar seu voto.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro ao comentar",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Erro ao comentar",
        description: "O comentário não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await supabase
        .from('suggestion_comments')
        .insert({
          suggestion_id: id,
          user_id: user.id,
          content: comment.trim()
        });

      setComment('');
      refetchComments();
      refetch(); // Para atualizar o contador de comentários
      
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi publicado com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao comentar:', error);
      toast({
        title: "Erro ao comentar",
        description: error.message || "Ocorreu um erro ao enviar seu comentário.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Button variant="ghost" className="flex items-center gap-2 mb-4" disabled>
          <ArrowLeft size={16} />
          Voltar para sugestões
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="container py-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-4" 
          onClick={() => navigate('/suggestions')}
        >
          <ArrowLeft size={16} />
          Voltar para sugestões
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Sugestão não encontrada</CardTitle>
            <CardDescription>
              A sugestão que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/suggestions')}>Ver todas as sugestões</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const status = statusMap[suggestion.status] || { label: 'Desconhecido', color: 'bg-gray-500' };
  const formattedDate = format(new Date(suggestion.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="container py-6 space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 mb-4" 
        onClick={() => navigate('/suggestions')}
      >
        <ArrowLeft size={16} />
        Voltar para sugestões
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
              <CardDescription>
                {suggestion.category?.name && (
                  <Badge variant="outline" className="mr-2">{suggestion.category.name}</Badge>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  {formattedDate}
                </span>
              </CardDescription>
            </div>
            <Badge className={`${status.color} text-white`}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{suggestion.description}</p>
          </div>

          <div className="flex items-center justify-between border-t border-b py-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={suggestion.user?.avatar_url || ''} />
                <AvatarFallback>{suggestion.user?.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{suggestion.user?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">Autor da sugestão</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant={userVote?.vote_type === 'upvote' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleVote('upvote')}
                disabled={voteLoading}
              >
                <ThumbsUp size={16} className="mr-1" />
                {suggestion.upvotes || 0}
              </Button>
              <Button 
                variant={userVote?.vote_type === 'downvote' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleVote('downvote')}
                disabled={voteLoading}
              >
                <ThumbsDown size={16} className="mr-1" />
                {suggestion.downvotes || 0}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Comentários ({comments.length})
            </h3>

            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                placeholder="Adicione um comentário..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                  {isSubmitting ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </form>

            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhum comentário ainda</h3>
                <p className="text-muted-foreground text-sm">Seja o primeiro a comentar nesta sugestão.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar_url || ''} />
                          <AvatarFallback>{comment.user?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{comment.user?.name || 'Usuário'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionDetailsPage;
