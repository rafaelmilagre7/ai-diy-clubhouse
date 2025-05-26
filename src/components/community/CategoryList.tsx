
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { ForumCategory } from '@/types/forumTypes';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CategoryListProps {
  onCategorySelect?: (categorySlug: string) => void;
  compact?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect,
  compact = false 
}) => {
  const { categories, isLoading, error, refetch } = useForumCategories();
  const navigate = useNavigate();

  const handleRetry = () => {
    refetch();
  };

  const handleCategoryClick = (category: ForumCategory) => {
    if (onCategorySelect) {
      onCategorySelect(category.slug);
    } else {
      navigate(`/comunidade/categoria/${category.slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className={`${compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className={compact ? "p-4" : "p-6"}>
              <div className="flex items-start gap-3">
                <Skeleton className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} rounded-lg flex-shrink-0`} />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className={`${compact ? 'h-4 w-24' : 'h-5 w-32'}`} />
                  {!compact && <Skeleton className="h-4 w-full" />}
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Erro ao carregar categorias do fórum.</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className={`${compact ? 'py-8' : 'py-12'} text-center`}>
          <MessageSquare className={`${compact ? 'h-10 w-10' : 'h-16 w-16'} text-muted-foreground mx-auto mb-4`} />
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold mb-2`}>
            Nenhuma categoria encontrada
          </h3>
          <p className="text-muted-foreground text-sm">
            As categorias do fórum serão carregadas em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {categories.slice(0, 5).map((category) => (
          <Card 
            key={category.id} 
            className="hover:bg-accent/50 transition-colors cursor-pointer group"
            onClick={() => handleCategoryClick(category)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                  style={{ 
                    backgroundColor: `${category.color || '#3B82F6'}20`, 
                    color: category.color || '#3B82F6' 
                  }}
                >
                  <span className="text-base leading-none">
                    {category.icon || '💬'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {category.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {category.topic_count || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {categories.length > 5 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => navigate('/comunidade')}
          >
            Ver todas as categorias
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer group"
          onClick={() => handleCategoryClick(category)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Header com ícone e contador */}
              <div className="flex items-start justify-between">
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform"
                  style={{ 
                    backgroundColor: `${category.color || '#3B82F6'}20`, 
                    color: category.color || '#3B82F6' 
                  }}
                >
                  <span className="text-xl leading-none">
                    {category.icon || '💬'}
                  </span>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  {category.topic_count || 0} tópicos
                </Badge>
              </div>
              
              {/* Conteúdo */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {category.name}
                </h3>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
              
              {/* Footer com estatísticas */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{category.topic_count || 0} tópicos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
