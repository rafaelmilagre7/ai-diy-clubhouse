
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

import SuggestionHeader from '@/components/suggestions/SuggestionHeader';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import SuggestionLoadingState from '@/components/suggestions/SuggestionLoadingState';
import { useComments } from '@/hooks/useComments';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'under_review' | 'approved' | 'in_development' | 'implemented' | 'rejected';
  upvotes: number;
  downvotes: number;
  created_at: string;
  category: { name: string };
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
}

const SuggestionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    comment, 
    setComment, 
    comments, 
    commentsLoading, 
    isSubmitting, 
    handleSubmitComment 
  } = useComments({ suggestionId: id || '' });

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
      return data as Suggestion;
    },
  });

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error("Você precisa estar logado para votar.");
      return;
    }

    try {
      await supabase
        .from('suggestion_votes')
        .upsert({
          suggestion_id: id,
          user_id: user.id,
          vote_type: voteType
        }, {
          onConflict: 'suggestion_id,user_id'
        });
      
      refetch();
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast.error(error.message || "Ocorreu um erro ao registrar seu voto.");
    }
  };

  if (isLoading) {
    return <SuggestionLoadingState />;
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

  return (
    <div className="container py-6 space-y-6">
      <SuggestionHeader />
      <SuggestionContent
        suggestion={suggestion}
        comment={comment}
        comments={comments}
        isSubmitting={isSubmitting}
        commentsLoading={commentsLoading}
        onCommentChange={setComment}
        onSubmitComment={handleSubmitComment}
        onVote={handleVote}
      />
    </div>
  );
};

export default SuggestionDetailsPage;
