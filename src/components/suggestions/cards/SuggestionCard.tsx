
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatRelativeDate } from '@/utils/suggestionUtils';
import { StatusBadge } from '../ui/StatusBadge';
import VoteDisplay from '../voting/VoteDisplay';
import { Eye, MessageCircle, TrendingUp } from 'lucide-react';
import { Suggestion } from '@/types/suggestionTypes';

interface SuggestionCardProps {
  suggestion: Suggestion;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = React.memo(({
  suggestion,
  getStatusLabel,
  getStatusColor
}) => {
  const navigate = useNavigate();

  const handleCardClick = React.useCallback(() => {
    navigate(`/suggestions/${suggestion.id}`);
  }, [navigate, suggestion.id]);

  const authorInitials = React.useMemo(() => {
    return suggestion.user_name
      ? suggestion.user_name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  }, [suggestion.user_name]);

  const isHighPriority = React.useMemo(() => {
    return suggestion.upvotes > 10 || suggestion.is_pinned;
  }, [suggestion.upvotes, suggestion.is_pinned]);

  return (
    <Card className="hover-lift cursor-pointer group animate-fade-in transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
              {suggestion.title}
            </h3>
            {suggestion.is_pinned && (
              <Badge variant="secondary" className="mt-2 text-xs bg-yellow-100 text-yellow-800">
                📌 Fixada
              </Badge>
            )}
          </div>
          <StatusBadge status={suggestion.status} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {suggestion.description}
        </p>

        <VoteDisplay
          upvotes={suggestion.upvotes}
          downvotes={suggestion.downvotes}
          showTrend={isHighPriority}
        />
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={suggestion.user_avatar} />
            <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{suggestion.user_name || 'Usuário'}</span>
            <span className="mx-1">•</span>
            <span>{formatRelativeDate(suggestion.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {suggestion.comment_count > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{suggestion.comment_count}</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCardClick}
            className="h-auto p-1 text-xs hover:text-primary"
          >
            Ver detalhes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

SuggestionCard.displayName = 'SuggestionCard';
