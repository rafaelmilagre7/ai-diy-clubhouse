
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';
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
      className={`
        group h-full cursor-pointer transition-all duration-300 
        bg-card/50 backdrop-blur-sm
        ${suggestion.status === 'implemented' 
          ? 'border-emerald-500/50 shadow-emerald-500/10 shadow-lg bg-emerald-50/30 dark:bg-emerald-950/20 hover:shadow-emerald-500/20 hover:shadow-xl hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30' 
          : 'border-border hover:shadow-md hover:-translate-y-1'
        }
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {suggestion.status === 'implemented' && (
                <CheckCircle className="inline w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
              )}
              {suggestion.title}
            </h3>
            <Badge 
              variant="secondary" 
              className={`
                ${getStatusColor(suggestion.status)} 
                text-xs font-medium px-3 py-1 rounded-full w-fit
                ${suggestion.status === 'implemented' 
                  ? 'ring-2 ring-emerald-500/30 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' 
                  : ''
                }
              `}
            >
              {getStatusLabel(suggestion.status)}
            </Badge>
          </div>
          
          {/* Score de votos moderno */}
          <div className="flex flex-col items-center bg-muted/30 rounded-xl p-3 min-w-[72px] border border-border/50">
            <div className={`text-xl font-semibold ${
              netVotes > 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : netVotes < 0 
                ? 'text-rose-500 dark:text-rose-400' 
                : 'text-muted-foreground'
            }`}>
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </div>
            <div className="text-xs text-muted-foreground font-medium">votos</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
          {suggestion.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-4 border-t border-border/30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              <span className="font-medium text-sm">{suggestion.upvotes || 0}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
              <ThumbsDown className="w-4 h-4" />
              <span className="font-medium text-sm">{suggestion.downvotes || 0}</span>
            </div>
          </div>
          
          {/* Mostrar contador de comentários para admins */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium text-sm">{suggestion.comment_count || 0}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
