import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '../ui/StatusBadge';
import SuggestionVoting from '../SuggestionVoting';
import SuggestionComments from '../SuggestionComments';
import { formatRelativeDate } from '@/utils/suggestionUtils';

interface SuggestionContainerProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    category?: { name: string };
    category_id?: string;
    upvotes: number;
    downvotes: number;
    user_id?: string;
    user_name?: string;
    user_avatar?: string;
    user_vote_type?: 'upvote' | 'downvote' | null;
    is_pinned?: boolean;
    category_name?: string;
    category_color?: string;
  };
  onVote: (voteType: 'upvote' | 'downvote') => Promise<void>;
  voteLoading?: boolean;
}

const SuggestionContainer: React.FC<SuggestionContainerProps> = ({
  suggestion,
  onVote,
  voteLoading = false
}) => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da sugestão */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{suggestion.title}</h1>
              <StatusBadge status={suggestion.status} />
            </div>
            
            {suggestion.is_pinned && (
              <Badge variant="secondary">📌 Fixado</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={suggestion.user_avatar} />
              <AvatarFallback>
                {suggestion.user_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{suggestion.user_name || 'Usuário'}</p>
              <p className="text-sm text-muted-foreground">
                {formatRelativeDate(suggestion.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line text-foreground">
              {suggestion.description}
            </p>
          </div>

          {(suggestion.category?.name || suggestion.category_name) && (
            <Badge 
              variant="outline"
              style={suggestion.category_color ? { 
                borderColor: suggestion.category_color,
                color: suggestion.category_color 
              } : undefined}
            >
              {suggestion.category?.name || suggestion.category_name}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Sistema de votação */}
      <SuggestionVoting
        suggestion={suggestion}
        voteLoading={voteLoading}
        onVote={onVote}
      />

      {/* Comentários */}
      <SuggestionComments suggestionId={suggestion.id} />
    </div>
  );
};

export default SuggestionContainer;
