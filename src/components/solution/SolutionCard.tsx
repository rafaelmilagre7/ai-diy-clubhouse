
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Solution } from "@/lib/supabase";
import { getCategoryDisplayName } from "@/lib/types/categoryTypes";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

const getCategoryColor = (category: Solution['category']) => {
  switch (category) {
    case 'Receita':
      return "bg-[#3949AB] text-white";
    case 'Operacional': 
      return "bg-[#0078B7] text-white";
    case 'Estratégia':
      return "bg-[#00897B] text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export const SolutionCard = ({ solution, onClick }: SolutionCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-[#1A1E2E] to-[#151823] border-[#2A2E3E] overflow-hidden"
      onClick={onClick}
    >
      {solution.thumbnail_url && (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getCategoryColor(solution.category)}>
            {getCategoryDisplayName(solution.category)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {solution.difficulty}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white group-hover:text-[#0ABAB5] transition-colors line-clamp-2">
            {solution.title}
          </h3>
          <p className="text-neutral-300 text-sm line-clamp-3">
            {solution.description}
          </p>
        </div>
        
        {solution.tags && solution.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {solution.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {solution.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{solution.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>Implementação guiada</span>
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-[#0ABAB5] transition-colors" />
        </div>
      </div>
    </Card>
  );
};
