import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WikiCategory } from "@/types/wikiTypes";
import * as Icons from "lucide-react";

interface WikiCategoryCardProps {
  category: WikiCategory;
}

export const WikiCategoryCard = ({ category }: WikiCategoryCardProps) => {
  const navigate = useNavigate();
  
  // Get the icon component dynamically
  const IconComponent = category.icon ? (Icons as any)[category.icon] : Icons.BookOpen;

  const handleClick = () => {
    navigate(`/wiki/categoria/${category.slug}`);
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
      onClick={handleClick}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div 
          className="w-16 h-16 rounded-lg mx-auto flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {IconComponent && (
            <IconComponent 
              className="h-8 w-8"
              style={{ color: category.color }}
            />
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
        </div>

        <Badge 
          variant="secondary" 
          className="text-xs"
          style={{ 
            backgroundColor: `${category.color}15`,
            color: category.color,
            borderColor: `${category.color}30`
          }}
        >
          Explorar Categoria
        </Badge>
      </CardContent>
    </Card>
  );
};