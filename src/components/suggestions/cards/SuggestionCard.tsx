
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageCircle, ThumbsUp } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SuggestionCardProps {
  suggestion: any;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export const SuggestionCard = ({ 
  suggestion, 
  getStatusLabel, 
  getStatusColor 
}: SuggestionCardProps) => {
  const navigate = useNavigate();
  const createdAtDate = new Date(suggestion.created_at);
  const timeAgo = formatDistance(createdAtDate, new Date(), { 
    addSuffix: true,
    locale: ptBR 
  });

  const handleClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };

  // Calcular o saldo de votos
  const voteBalance = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);

  return (
    <Card 
      key={suggestion.id} 
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="line-clamp-1 hover:text-primary text-lg font-semibold">
              {suggestion.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
              {suggestion.category && (
                <Badge variant="outline">{suggestion.category.name}</Badge>
              )}
              <span className="flex items-center text-xs gap-1">
                <Calendar size={12} />
                {timeAgo}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {suggestion.description}
        </p>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between items-center border-t">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={suggestion.user_avatar} />
            <AvatarFallback>{(suggestion.user_name || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {suggestion.user_name || 'Usuário'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <Badge className={`text-xs ${getStatusColor(suggestion.status)}`}>
            {getStatusLabel(suggestion.status)}
          </Badge>
          
          <div className="flex items-center gap-1 text-xs">
            <ThumbsUp size={14} className={voteBalance >= 0 ? "text-green-600" : "text-red-600"} />
            <span className={voteBalance >= 0 ? "text-green-600" : "text-red-600"}>
              {voteBalance > 0 ? `+${voteBalance}` : voteBalance}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <MessageCircle size={14} />
            {suggestion.comment_count || 0}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
