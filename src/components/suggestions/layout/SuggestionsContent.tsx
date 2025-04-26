
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Suggestion } from '@/types/suggestionTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface SuggestionsContentProps {
  suggestions: Suggestion[];
  searchQuery: string;
  isLoading: boolean;
}

export const SuggestionsContent: React.FC<SuggestionsContentProps> = ({ 
  suggestions,
  searchQuery,
  isLoading
}) => {
  // Renderizar skeletons durante o carregamento
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-4/5 mb-2" />
              <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Nenhuma sugestão encontrada
        </h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `Não encontramos sugestões com o termo "${searchQuery}".` 
            : 'Não há sugestões disponíveis no momento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suggestions.map((suggestion) => (
        <Link key={suggestion.id} to={`/suggestions/${suggestion.id}`}>
          <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="line-clamp-2">{suggestion.title}</CardTitle>
              <CardDescription className="flex gap-2 items-center flex-wrap">
                <Badge variant="outline" className="bg-muted/50">
                  {suggestion.category}
                </Badge>
                {suggestion.is_implemented && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                    Implementado
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {suggestion.description}
              </p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{suggestion.upvotes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{suggestion.comment_count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
