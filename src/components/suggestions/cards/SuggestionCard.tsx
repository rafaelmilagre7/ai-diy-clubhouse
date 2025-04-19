
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
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

  // Extrai informações do perfil, lidando com estruturas diferentes
  const profileName = suggestion.profiles?.name || 
                     (suggestion.profiles && suggestion.profiles[0]?.name) || 
                     'Usuário';
  
  const profileAvatar = suggestion.profiles?.avatar_url || 
                       (suggestion.profiles && suggestion.profiles[0]?.avatar_url) || 
                       '';

  console.log('Rendering suggestion card:', suggestion);

  return (
    <Card key={suggestion.id} className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
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
            <AvatarImage src={profileAvatar} />
            <AvatarFallback>{profileName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {profileName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Badge className={`text-xs ${getStatusColor(suggestion.status)}`}>
            {getStatusLabel(suggestion.status)}
          </Badge>
          <div className="flex items-center gap-1 text-xs">
            <ThumbsUp size={14} className="text-green-600" />
            {suggestion.upvotes || 0}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ThumbsDown size={14} className="text-red-600" />
            {suggestion.downvotes || 0}
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
