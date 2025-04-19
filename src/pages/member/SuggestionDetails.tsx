
import React, { useState, useEffect } from 'react';
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
  user_id: string;
  category: { name: string };
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
}

interface UserVote {
  id: string;
  vote_type: 'upvote' | 'downvote';
}

const SuggestionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [voteLoading, setVoteLoading] = useState(false);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  
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
      console.log("Sugestão carregada:", data);
      return data as Suggestion;
    },
  });

  // Buscar voto do usuário atual
  useEffect(() => {
    if (!user || !id) return;
    
    const fetchUserVote = async () => {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('id, vote_type')
        .eq('suggestion_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Erro ao buscar voto do usuário:", error);
        return;
      }
      
      setUserVote(data as UserVote);
    };
    
    fetchUserVote();
  }, [id, user]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error("Você precisa estar logado para votar.");
      return;
    }

    if (!id) return;
    
    try {
      setVoteLoading(true);
      console.log("Votando:", { voteType, suggestionId: id, userId: user.id });
      
      // Verificar se o usuário já votou nesta sugestão
      const { data: existingVote, error: checkError } = await supabase
        .from('suggestion_votes')
        .select('id, vote_type')
        .eq('suggestion_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Erro ao verificar voto existente:", checkError);
        throw checkError;
      }
      
      // Inserir ou atualizar o voto
      const { data: voteData, error: voteError } = await supabase
        .from('suggestion_votes')
        .upsert({
          suggestion_id: id,
          user_id: user.id,
          vote_type: voteType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'suggestion_id,user_id'
        })
        .select();

      if (voteError) {
        console.error("Erro ao registrar voto:", voteError);
        throw voteError;
      }
      
      // Atualizar contagem de votos na tabela suggestions
      if (!existingVote) {
        // Novo voto
        if (voteType === 'upvote') {
          await supabase.rpc('increment_suggestion_upvote', { suggestion_id: id });
        } else {
          await supabase.rpc('increment_suggestion_downvote', { suggestion_id: id });
        }
      } else if (existingVote.vote_type !== voteType) {
        // Mudança de voto
        if (voteType === 'upvote') {
          // Mudou de downvote para upvote
          await supabase.rpc('increment_suggestion_upvote', { suggestion_id: id });
          await supabase.rpc('decrement_suggestion_downvote', { suggestion_id: id });
        } else {
          // Mudou de upvote para downvote
          await supabase.rpc('increment_suggestion_downvote', { suggestion_id: id });
          await supabase.rpc('decrement_suggestion_upvote', { suggestion_id: id });
        }
      }
      
      // Atualizar o estado do voto do usuário localmente
      setUserVote({ 
        id: existingVote?.id || (voteData && voteData[0]?.id) || '', 
        vote_type: voteType 
      });
      
      toast.success(`Seu voto foi registrado!`);
      refetch();
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast.error(error.message || "Ocorreu um erro ao registrar seu voto.");
    } finally {
      setVoteLoading(false);
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

  // Verificar se o usuário é o criador da sugestão
  const isOwner = user && user.id === suggestion.user_id;

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
        isOwner={isOwner}
        userVote={userVote}
        voteLoading={voteLoading}
      />
    </div>
  );
};

export default SuggestionDetailsPage;
