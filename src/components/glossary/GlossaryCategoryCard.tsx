import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { GlossaryCategory } from "@/types/glossaryTypes";

interface GlossaryCategoryCardProps {
  category: GlossaryCategory;
  onClick: () => void;
}

export const GlossaryCategoryCard = ({ category, onClick }: GlossaryCategoryCardProps) => {
  const IconComponent = category.icon ? (Icons[category.icon as keyof typeof Icons] as LucideIcon) : Icons.Brain;

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 group h-full bg-gradient-to-br from-card to-card/50 border-0 overflow-hidden relative"
      onClick={onClick}
    >
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)` }}
      />
      
      {/* Accent border */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 group-hover:h-2 transition-all duration-300"
        style={{ backgroundColor: category.color }}
      />

      <CardContent className="p-8 text-center relative z-10 h-full flex flex-col justify-center">
        <div 
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
          style={{ 
            backgroundColor: `${category.color}15`,
            border: `2px solid ${category.color}30`
          }}
        >
          <IconComponent 
            className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" 
            style={{ color: category.color }}
          />
        </div>
        
        <h3 
          className="text-xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300"
          style={{ color: category.color }}
        >
          {category.name}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {category.description}
        </p>
        
        {/* Hover indicator */}
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: category.color }}>
            <span>Explorar conceitos</span>
            <Icons.ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};