
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Suggestion } from '@/types/suggestionTypes';

interface SuggestionCardProps {
  suggestion: Suggestion;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  getStatusLabel,
  getStatusColor
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const handleCardClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };

  const netVotes = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);
  
  return (
    <Card 
      className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{suggestion.title}</h3>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(suggestion.status)} text-xs font-medium w-fit`}
            >
              {getStatusLabel(suggestion.status)}
            </Badge>
          </div>
          
          {/* Score de votos mais prominente */}
          <div className="flex flex-col items-center bg-muted/50 rounded-xl p-3 min-w-[70px] border">
            <div className={`text-xl font-bold ${netVotes > 0 ? 'text-green-600' : netVotes < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </div>
            <div className="text-xs text-muted-foreground font-medium">votos</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">{suggestion.description}</p>
      </CardContent>
      
      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              <span className="font-medium">{suggestion.upvotes || 0}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-red-500">
              <ThumbsDown className="h-4 w-4" />
              <span className="font-medium">{suggestion.downvotes || 0}</span>
            </div>
          </div>
          
          {/* Mostrar contador de comentários apenas para admins */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{suggestion.comment_count || 0}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
