
import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrailSolutionCardProps {
  solution: any;
  onClick: (id: string) => void;
}

export const TrailSolutionCard: React.FC<TrailSolutionCardProps> = ({ solution, onClick }) => {
  // Determinar cor com base na prioridade
  const getPriorityColor = () => {
    switch (solution.priority) {
      case 1:
        return "border-[#0ABAB5]/30 hover:border-[#0ABAB5] bg-[#0ABAB5]/5 hover:bg-[#0ABAB5]/10";
      case 2:
        return "border-amber-300/30 hover:border-amber-400 bg-amber-50 hover:bg-amber-100/50";
      case 3:
        return "border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/50";
      default:
        return "border-gray-200 hover:border-gray-300";
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center p-4 rounded-lg border transition-all cursor-pointer gap-3",
        getPriorityColor()
      )}
      onClick={() => onClick(solution.solutionId)}
    >
      {solution.image_url ? (
        <img 
          src={solution.image_url} 
          alt={solution.title || "Solução"} 
          className="h-12 w-12 rounded-md object-cover" 
        />
      ) : (
        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
          IA
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {solution.title || "Solução sem título"}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
          {solution.justification || solution.description || "Recomendação personalizada para seu negócio"}
        </p>
      </div>
      
      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
    </div>
  );
};
