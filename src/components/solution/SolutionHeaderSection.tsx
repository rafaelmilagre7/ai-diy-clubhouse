
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getCategoryDisplayName, getCategoryStyles } from "@/lib/types/categoryTypes";
import { Solution } from "@/types/solution";
import { Users, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionHeaderSectionProps {
  solution: Solution;
  implementationMetrics?: any;
}

export const SolutionHeaderSection = ({ 
  solution,
  implementationMetrics
}: SolutionHeaderSectionProps) => {
  const categoryStyles = getCategoryStyles(solution.category);
  const categoryName = getCategoryDisplayName(solution.category);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge className={cn("capitalize", categoryStyles.badge)}>
          {categoryName}
        </Badge>
        
        <Badge variant="outline" className={cn(
          solution.difficulty === "easy" && "border-green-200 bg-green-50 text-green-600",
          solution.difficulty === "medium" && "border-amber-200 bg-amber-50 text-amber-600",
          solution.difficulty === "advanced" && "border-red-200 bg-red-50 text-red-600",
        )}>
          {solution.difficulty === "easy" && "Fácil"}
          {solution.difficulty === "medium" && "Média"}
          {solution.difficulty === "advanced" && "Avançada"}
        </Badge>
      </div>
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{solution.title}</h1>
        <p className="mt-2 text-muted-foreground">{solution.description}</p>
      </div>
      
      <div className="flex flex-wrap gap-4 pt-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{solution.estimated_time || 30} minutos</span>
        </div>
        
        {implementationMetrics?.total_completions > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>{implementationMetrics.total_completions} implementações</span>
          </div>
        )}
        
        {solution.success_rate > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Award className="mr-1 h-4 w-4" />
            <span>{solution.success_rate}% de sucesso</span>
          </div>
        )}
      </div>
      
      {solution.thumbnail_url && (
        <div className="mt-4 overflow-hidden rounded-lg border">
          <img
            src={solution.thumbnail_url}
            alt={solution.title}
            className="h-[200px] w-full object-cover"
          />
        </div>
      )}
    </div>
  );
};
