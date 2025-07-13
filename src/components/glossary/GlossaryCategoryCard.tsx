import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { GlossaryCategory } from "@/types/glossaryTypes";

interface GlossaryCategoryCardProps {
  category: GlossaryCategory;
  onClick: () => void;
}

export const GlossaryCategoryCard = ({ category, onClick }: GlossaryCategoryCardProps) => {
  const IconComponent = category.icon ? (Icons[category.icon as keyof typeof Icons] as LucideIcon) : Icons.BookOpen;

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group h-full border-2"
      onClick={onClick}
      style={{ borderColor: `${category.color}20` }}
    >
      <CardHeader className="text-center pb-3">
        <div 
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <IconComponent 
            className="h-8 w-8" 
            style={{ color: category.color }}
          />
        </div>
        <h3 
          className="text-lg font-semibold group-hover:scale-105 transition-transform"
          style={{ color: category.color }}
        >
          {category.name}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0 text-center">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      </CardContent>
    </Card>
  );
};