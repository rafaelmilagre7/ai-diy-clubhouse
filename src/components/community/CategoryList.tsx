
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForumCategory } from '@/types/forumTypes';

interface CategoryListProps {
  categories: ForumCategory[];
  compact?: boolean;
  onCategorySelect?: (categorySlug: string) => void;
}

export const CategoryList = ({ categories, compact = false, onCategorySelect }: CategoryListProps) => {
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
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {!compact && (
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
