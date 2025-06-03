
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface SuggestionCardProps {
  suggestion: {
    id: string;
    title: string;
    description: string;
    status: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
    profiles?: {
      name: string;
      avatar_url: string;
    };
  };
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Nova';
    case 'under_review':
      return 'Em Análise';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'completed':
      return 'Implementada';
    case 'declined':
      return 'Recusada';
    default:
      return 'Desconhecida';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-500 text-white';
    case 'under_review':
      return 'bg-purple-500 text-white';
    case 'in_development':
      return 'bg-amber-500 text-white';
    case 'completed':
      return 'bg-green-500 text-white';
    case 'declined':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const userName = suggestion.user_name || suggestion.profiles?.name || 'Usuário Anônimo';
  const userAvatar = suggestion.user_avatar || suggestion.profiles?.avatar_url;
  const voteBalance = suggestion.upvotes - suggestion.downvotes;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleClick = () => {
    if (isAdmin) {
      navigate(`/admin/suggestions/${suggestion.id}`);
    } else {
      navigate(`/suggestions/${suggestion.id}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-white/10"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {suggestion.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Avatar className="h-5 w-5">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={userName} />
                ) : (
                  <AvatarFallback className="text-xs bg-viverblue text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span>{userName}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(suggestion.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(suggestion.status)}>
            {getStatusLabel(suggestion.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {suggestion.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span>{suggestion.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span>{suggestion.downvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>{suggestion.comment_count}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className={voteBalance > 0 ? 'text-green-500' : voteBalance < 0 ? 'text-red-500' : 'text-gray-400'}>
              {voteBalance > 0 ? `+${voteBalance}` : voteBalance} votos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
