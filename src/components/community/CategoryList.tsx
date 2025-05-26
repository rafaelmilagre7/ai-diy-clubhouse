
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
}

export const CategoryList: React.FC<CategoryListProps> = ({ onCategorySelect }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
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
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground">
            As categorias do fórum serão carregadas em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => handleCategoryClick(category)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                style={{ 
                  backgroundColor: `${category.color || '#3B82F6'}20`, 
                  color: category.color || '#3B82F6' 
                }}
              >
                {category.icon || '💬'}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {category.description}
                </p>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{category.topic_count || 0} tópicos</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
