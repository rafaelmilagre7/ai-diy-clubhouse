
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForumCategory } from '@/types/forumTypes';
import { useForumCategories } from '@/hooks/community/useForumCategories';

interface CategoryListProps {
  categories?: ForumCategory[];
  compact?: boolean;
  onCategorySelect?: (categorySlug: string) => void;
}

export const CategoryList = ({ categories: propCategories, compact = false, onCategorySelect }: CategoryListProps) => {
  const { categories: hookCategories, isLoading, error } = useForumCategories();
  const categories = propCategories || hookCategories;

  console.log('CategoryList - Renderizando com categorias:', categories?.length || 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">Categorias</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar categorias:', error);
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">Categorias</h3>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center text-red-600">
            <p>Erro ao carregar categorias</p>
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    console.warn('Nenhuma categoria encontrada');
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">Categorias</h3>
        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center text-yellow-600">
            <Hash className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhuma categoria disponível</p>
            <p className="text-sm text-yellow-500 mt-1">
              As categorias serão exibidas quando forem criadas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Categorias</h3>
      
      <div className="grid gap-3">
        {categories.map((category) => (
          <Link key={category.id} to={`/comunidade/categoria/${category.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {category.icon || '📁'}
                    </div>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {!compact && category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {category.topic_count || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
