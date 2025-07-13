import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Tag, Star } from "lucide-react";
import { WikiArticleWithCategory } from "@/types/wikiTypes";

interface WikiArticleCardProps {
  article: WikiArticleWithCategory;
}

export const WikiArticleCard = ({ article }: WikiArticleCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/wiki/artigo/${article.slug}`);
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avancado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Iniciante';
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group h-full"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {article.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
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
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </div>
          <Badge className={`text-xs ${getDifficultyColor(article.difficulty_level)}`}>
            {getDifficultyLabel(article.difficulty_level)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
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
  );
};