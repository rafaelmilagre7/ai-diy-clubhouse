
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Suggestion } from '@/types/suggestionTypes';
import { StatusBadge } from './StatusBadge';
import { formatRelativeDate, truncateText } from '@/utils/suggestionUtils';
import { useVoting } from '@/hooks/suggestions/useVoting';

interface SuggestionItemProps {
  suggestion: Suggestion;
  onVote?: () => void;
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({ 
  suggestion, 
  onVote 
}) => {
  const navigate = useNavigate();
  const { voteLoading, voteMutation } = useVoting();

  const handleClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };

  const handleVote = async (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    e.stopPropagation();
    
    try {
      await voteMutation.mutateAsync({
        suggestionId: suggestion.id,
        voteType
      });
      onVote?.();
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const getUserVoteType = () => {
    return suggestion.user_vote_type;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-tight line-clamp-2 mb-2">
              {suggestion.title}
            </h3>
            <StatusBadge status={suggestion.status} size="sm" />
          </div>
          
          {suggestion.is_pinned && (
            <Badge variant="secondary" className="shrink-0">
              Fixado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {truncateText(suggestion.description, 120)}
        </p>
        
        {suggestion.category_name && (
          <Badge variant="outline" className="mt-3">
            {suggestion.category_name}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="w-full space-y-3">
          {/* Autor e Data */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={suggestion.user_avatar} />
              <AvatarFallback className="text-xs">
                {suggestion.user_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {suggestion.user_name || 'Usuário'} • {formatRelativeDate(suggestion.created_at)}
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant={getUserVoteType() === 'upvote' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2 gap-1"
                onClick={(e) => handleVote(e, 'upvote')}
                disabled={voteLoading}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs">{suggestion.upvotes}</span>
              </Button>

              <Button
                variant={getUserVoteType() === 'downvote' ? 'destructive' : 'ghost'}
                size="sm"
                className="h-8 px-2 gap-1"
                onClick={(e) => handleVote(e, 'downvote')}
                disabled={voteLoading}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-xs">{suggestion.downvotes}</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {suggestion.comment_count || 0}
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
