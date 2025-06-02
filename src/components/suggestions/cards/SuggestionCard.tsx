
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatRelativeDate } from '@/utils/suggestionUtils';
import { StatusBadge } from '../ui/StatusBadge';
import VoteDisplay from '../voting/VoteDisplay';
import { Eye, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react';
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

  const totalVotes = suggestion.upvotes + suggestion.downvotes;
  const engagementLevel = totalVotes > 20 ? 'high' : totalVotes > 5 ? 'medium' : 'low';

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br from-card via-card to-card/95"
      onClick={handleCardClick}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      
      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {suggestion.is_pinned && (
              <Badge variant="secondary" className="w-fit bg-yellow-100 text-yellow-800 text-xs font-medium">
                📌 Fixada
              </Badge>
            )}
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {suggestion.title}
            </h3>
          </div>
          <StatusBadge status={suggestion.status} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
          {suggestion.description}
        </p>

        <div className="flex items-center justify-between">
          <VoteDisplay
            upvotes={suggestion.upvotes}
            downvotes={suggestion.downvotes}
            showTrend={isHighPriority}
            compact={true}
          />
          
          {engagementLevel === 'high' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7 ring-2 ring-background">
            <AvatarImage src={suggestion.user_avatar} />
            <AvatarFallback className="text-xs font-medium">{authorInitials}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{suggestion.user_name || 'Usuário'}</span>
            <span className="mx-2">•</span>
            <span>{formatRelativeDate(suggestion.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {suggestion.comment_count > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{suggestion.comment_count}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-primary group-hover:bg-primary/10"
          >
            Ver detalhes
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

SuggestionCard.displayName = 'SuggestionCard';
