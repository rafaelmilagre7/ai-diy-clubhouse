
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Suggestion } from '@/types/suggestionTypes';
import { StatusBadge } from '../ui/StatusBadge';
import { formatRelativeDate, calculatePopularity } from '@/utils/suggestionUtils';

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
  const popularity = calculatePopularity(suggestion.upvotes, suggestion.downvotes);
  const isHotSuggestion = suggestion.upvotes > 10 && popularity > 80;
  
  const handleCardClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };
  
  return (
    <Card 
      className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group animate-fade-in"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={suggestion.status} size="sm" />
              {isHotSuggestion && (
                <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>Popular</span>
                </div>
              )}
              {suggestion.is_pinned && (
                <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                  Fixada
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {suggestion.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {suggestion.description}
        </p>
        
        <div className="mt-3 text-xs text-muted-foreground">
          {formatRelativeDate(suggestion.created_at)}
          {suggestion.user_name && ` • por ${suggestion.user_name}`}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:text-green-600 transition-colors">
              <ThumbsUp className="h-4 w-4" />
              <span className="font-medium">{suggestion.upvotes}</span>
            </div>
            
            <div className="flex items-center gap-1 hover:text-red-600 transition-colors">
              <ThumbsDown className="h-4 w-4" />
              <span className="font-medium">{suggestion.downvotes}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{suggestion.comment_count || 0}</span>
          </div>
        </div>
        
        {popularity > 0 && (
          <div className="mt-2 w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Aprovação</span>
              <span>{popularity}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${popularity}%` }}
              />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
