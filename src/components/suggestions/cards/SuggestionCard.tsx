
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Suggestion } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';

interface SuggestionCardProps {
  suggestion: Suggestion;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  getStatusLabel,
  getStatusColor,
}) => {
  const { isAdmin } = useAuth();
  const voteBalance = suggestion.upvotes - suggestion.downvotes;
  
  // Determinar o link de navegação com base no tipo de usuário
  // Administradores vão para um caminho específico para admin
  const linkPath = isAdmin 
    ? `/admin/suggestions/${suggestion.id}` 
    : `/suggestions/${suggestion.id}`;
  
  return (
    <Link to={linkPath}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(suggestion.status)}>
              {getStatusLabel(suggestion.status)}
            </Badge>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(suggestion.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
          
          <h3 className="font-medium text-base">{suggestion.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {suggestion.description}
          </p>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1" />
            <span>{voteBalance}</span>
          </div>
          
          <div className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span>{suggestion.comment_count} comentários</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
