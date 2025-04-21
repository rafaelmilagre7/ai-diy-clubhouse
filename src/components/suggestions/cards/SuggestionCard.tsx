
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  
  const handleCardClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };
  
  return (
    <Card 
      className="h-full cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2">{suggestion.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(suggestion.status)}>
                {getStatusLabel(suggestion.status)}
              </Badge>
            </div>
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
            <span>{suggestion.upvotes}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            <span>{suggestion.downvotes}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{suggestion.comment_count || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
