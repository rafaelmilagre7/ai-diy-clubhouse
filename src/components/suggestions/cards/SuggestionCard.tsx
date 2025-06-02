
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Pin,
  TrendingUp,
  Clock,
  User
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { formatRelativeDate } from '@/utils/suggestionUtils';
import { Suggestion } from '@/types/suggestionTypes';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  const netVotes = suggestion.upvotes - suggestion.downvotes;
  const totalVotes = suggestion.upvotes + suggestion.downvotes;
  const upvotePercentage = totalVotes > 0 ? (suggestion.upvotes / totalVotes) * 100 : 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border">
      <CardHeader className="space-y-4">
        {/* Cabeçalho com status e pin */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={suggestion.status} />
            {suggestion.is_pinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" />
                Fixado
              </Badge>
            )}
          </div>
          
          {/* Indicador de tendência */}
          {upvotePercentage >= 75 && totalVotes >= 5 && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Popular</span>
            </div>
          )}
        </div>

        {/* Título */}
        <div>
          <Link to={`/suggestions/${suggestion.id}`}>
            <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {suggestion.title}
            </h3>
          </Link>
        </div>

        {/* Autor e data */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-border">
            <AvatarImage src={suggestion.user_avatar || suggestion.profiles?.avatar_url} />
            <AvatarFallback className="bg-muted">
              {suggestion.user_name?.charAt(0) || suggestion.profiles?.name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {suggestion.user_name || suggestion.profiles?.name || 'Usuário'}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatRelativeDate(suggestion.created_at)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {suggestion.description}
        </p>

        {/* Categoria */}
        {(suggestion.category_name || suggestion.suggestion_categories?.name) && (
          <Badge 
            variant="outline" 
            className="w-fit"
            style={suggestion.category_color || suggestion.suggestion_categories?.color ? {
              borderColor: suggestion.category_color || suggestion.suggestion_categories?.color,
              color: suggestion.category_color || suggestion.suggestion_categories?.color
            } : undefined}
          >
            {suggestion.category_name || suggestion.suggestion_categories?.name}
          </Badge>
        )}

        {/* Métricas */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Votação */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${netVotes > 0 ? 'text-green-600' : netVotes < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                <ThumbsUp className="h-4 w-4" />
                <span className="font-semibold text-sm">{suggestion.upvotes}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm">{suggestion.downvotes}</span>
              </div>
            </div>

            {/* Comentários */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{suggestion.comment_count || 0}</span>
            </div>
          </div>

          {/* Botão de ação */}
          <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={`/suggestions/${suggestion.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Ver detalhes
            </Link>
          </Button>
        </div>

        {/* Barra de aprovação */}
        {totalVotes > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(upvotePercentage)}% de aprovação</span>
              <span>{totalVotes} votos</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${upvotePercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
