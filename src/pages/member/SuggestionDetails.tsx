import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import SuggestionHeader from '@/components/suggestions/SuggestionHeader';
import SuggestionVoting from '@/components/suggestions/SuggestionVoting';
import CommentForm from '@/components/suggestions/CommentForm';
import CommentsList from '@/components/suggestions/CommentsList';

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
  const { user } = useAuth();
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
      if (userVote && userVote.vote_type === voteType) {
        await supabase
          .from('suggestion_votes')
          .delete()
          .eq('id', userVote.id);
      } else {
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
      refetch();
      
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
        <SuggestionHeader />
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
        <SuggestionHeader />
        <Card>
          <CardHeader>
            <CardTitle>Sugestão não encontrada</CardTitle>
            <CardDescription>
              A sugestão que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const status = statusMap[suggestion.status] || { label: 'Desconhecido', color: 'bg-gray-500' };
  const formattedDate = format(new Date(suggestion.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="container py-6 space-y-6">
      <SuggestionHeader />

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

            <SuggestionVoting
              suggestion={suggestion}
              userVote={userVote}
              voteLoading={voteLoading}
              onVote={handleVote}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Comentários ({comments.length})
            </h3>

            <CommentForm
              comment={comment}
              isSubmitting={isSubmitting}
              onCommentChange={setComment}
              onSubmit={handleSubmitComment}
            />

            <CommentsList
              comments={comments}
              isLoading={commentsLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionDetailsPage;
