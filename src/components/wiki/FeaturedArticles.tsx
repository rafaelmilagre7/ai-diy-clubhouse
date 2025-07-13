import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Eye } from "lucide-react";
import { WikiArticleWithCategory } from "@/types/wikiTypes";

interface FeaturedArticlesProps {
  articles: WikiArticleWithCategory[];
}

export const FeaturedArticles = ({ articles }: FeaturedArticlesProps) => {
  const navigate = useNavigate();

  if (!articles || articles.length === 0) return null;

  const handleArticleClick = (slug: string) => {
    navigate(`/wiki/artigo/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="h-6 w-6 text-yellow-500 fill-current" />
          <h2 className="text-2xl font-semibold">Artigos em Destaque</h2>
        </div>
        <p className="text-muted-foreground">
          Os artigos mais populares e importantes para começar sua jornada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card 
            key={article.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden"
            onClick={() => handleArticleClick(article.slug)}
          >
            {/* Featured Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-yellow-500 text-yellow-900 border-yellow-600">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Destaque
              </Badge>
            </div>

            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
              style={{ 
                background: `linear-gradient(135deg, ${article.category_color || '#6366f1'}, transparent)` 
              }}
            />

            <CardContent className="p-6 space-y-4 relative">
              <div className="space-y-2">
                {article.category_name && (
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: article.category_color,
                      color: article.category_color 
                    }}
                  >
                    {article.category_name}
                  </Badge>
                )}
                
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </div>

              {article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  {article.reading_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.reading_time_minutes} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{article.view_count || 0}</span>
                  </div>
                </div>
                
                {article.author_name && (
                  <span className="text-xs">
                    por {article.author_name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};