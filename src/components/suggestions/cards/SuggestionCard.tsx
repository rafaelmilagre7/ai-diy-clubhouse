
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
      className="h-full cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg line-clamp-2">{suggestion.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(suggestion.status)}>
                {getStatusLabel(suggestion.status)}
              </Badge>
            </div>
          </div>
          
          {/* Destaque dos votos líquidos */}
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
            <div className="text-lg font-bold text-viverblue">
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </div>
            <div className="text-xs text-gray-500">votos</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-muted-foreground line-clamp-3">{suggestion.description}</p>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{suggestion.upvotes || 0}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            <span>{suggestion.downvotes || 0}</span>
          </div>
        </div>
        
        {/* Mostrar contador de comentários apenas para admins */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{suggestion.comment_count || 0}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
