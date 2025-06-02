
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Eye, MessageCircle, TrendingUp } from 'lucide-react';
import { StatusBadge } from '@/components/suggestions/ui/StatusBadge';
import { VoteAnimation } from '@/components/suggestions/animations/VoteAnimation';
import { SuggestionComments } from '@/components/suggestions/SuggestionComments';
import { useVoting } from '@/hooks/suggestions/useVoting';
import { formatRelativeDate } from '@/utils/suggestionUtils';
import { Suggestion } from '@/types/suggestionTypes';
import VoteDisplay from '@/components/suggestions/voting/VoteDisplay';

const SuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { voteLoading, voteMutation } = useVoting();

  const { data: suggestion, isLoading, error } = useQuery({
    queryKey: ['suggestion', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da sugestão não fornecido');

      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          profiles!suggestions_user_id_fkey (
            name,
            avatar_url
          ),
          suggestion_categories!suggestions_category_id_fkey (
            name,
            color
          ),
          suggestion_votes!left (
            vote_type,
            user_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const userVote = data.suggestion_votes?.find(
        (vote: any) => vote.user_id === user?.id
      );

      return {
        ...data,
        user_name: data.profiles?.name || 'Usuário',
        user_avatar: data.profiles?.avatar_url || '',
        user_vote_type: userVote?.vote_type || null,
        category_name: data.suggestion_categories?.name,
        category_color: data.suggestion_categories?.color
      } as Suggestion & {
        category_name?: string;
        category_color?: string;
      };
    },
    enabled: !!id,
  });

  const handleVote = React.useCallback(async (voteType: 'upvote' | 'downvote', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    await voteMutation.mutateAsync({ 
      suggestionId: id, 
      voteType 
    });
  }, [voteMutation, id]);

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="container py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Sugestão não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A sugestão que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => navigate('/suggestions')}>
              Voltar para Sugestões
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const authorInitials = suggestion.user_name
    ? suggestion.user_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const isHighPriority = suggestion.upvotes > 10 || suggestion.is_pinned;

  return (
    <div className="container py-8 max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/suggestions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Sugestões
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {suggestion.is_pinned && (
                <Badge variant="secondary" className="w-fit bg-yellow-100 text-yellow-800">
                  📌 Fixada
                </Badge>
              )}
              
              <h1 className="text-2xl font-bold leading-tight">
                {suggestion.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={suggestion.user_avatar} />
                    <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{suggestion.user_name}</span>
                </div>
                <span>•</span>
                <span>{formatRelativeDate(suggestion.created_at)}</span>
                {suggestion.comment_count > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{suggestion.comment_count} comentários</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusBadge status={suggestion.status} />
              {suggestion.category_name && (
                <Badge 
                  variant="outline" 
                  style={{ borderColor: suggestion.category_color }}
                >
                  {suggestion.category_name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {suggestion.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <VoteDisplay
                upvotes={suggestion.upvotes}
                downvotes={suggestion.downvotes}
                showTrend={isHighPriority}
                compact={false}
              />
              
              {isHighPriority && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <VoteAnimation
                  type="upvote"
                  isActive={suggestion.user_vote_type === 'upvote'}
                  onClick={(e) => handleVote('upvote', e)}
                  disabled={voteLoading}
                />
                <VoteAnimation
                  type="downvote"
                  isActive={suggestion.user_vote_type === 'downvote'}
                  onClick={(e) => handleVote('downvote', e)}
                  disabled={voteLoading}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SuggestionComments suggestionId={suggestion.id} />
    </div>
  );
};

export default SuggestionDetails;
