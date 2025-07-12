
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Suggestion } from '@/types/suggestionTypes';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const { profile } = useAuth();
  
  const handleCardClick = () => {
    navigate(`/suggestions/${suggestion.id}`);
  };

  const netVotes = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);
  const isPopular = netVotes >= 5;
  const isRecent = new Date(suggestion.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_development':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const userName = suggestion.profiles?.name || suggestion.user_name || 'Usuário';
  const userAvatar = suggestion.profiles?.avatar_url || suggestion.user_avatar;
  
  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm"
      onClick={handleCardClick}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Popular indicator */}
      {isPopular && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <TrendingUp className="h-3 w-3" />
            Popular
          </div>
        </div>
      )}
      
      {/* Recent indicator */}
      {isRecent && !isPopular && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            Novo
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="outline" 
            className={cn("border font-medium", getStatusBadgeStyle(suggestion.status))}
          >
            {getStatusLabel(suggestion.status)}
          </Badge>
          
          {/* Vote Score */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-colors",
              netVotes > 0 ? "bg-green-100 text-green-700" : 
              netVotes < 0 ? "bg-red-100 text-red-700" : 
              "bg-gray-100 text-gray-600"
            )}>
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {suggestion.title}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
          {suggestion.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground font-medium">
              {userName}
            </span>
          </div>
          
          {/* Date */}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(suggestion.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">{suggestion.upvotes || 0}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <span className="font-medium">{suggestion.downvotes || 0}</span>
            </div>
          </div>
          
          {/* Comments count (sempre visível) */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{suggestion.comment_count || 0}</span>
          </div>
        </div>
      </CardContent>
      
      {/* Subtle border highlight on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-colors duration-300 pointer-events-none"></div>
    </Card>
  );
};
