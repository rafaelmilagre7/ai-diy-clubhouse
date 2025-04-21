
import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TrailSolutionCardProps {
  solution: any;
  onClick: (id: string) => void;
}

export const TrailSolutionCard: React.FC<TrailSolutionCardProps> = ({ solution, onClick }) => {
  // Verificação de segurança para garantir que temos dados válidos
  if (!solution || !solution.solutionId) {
    return null;
  }

  // Determinar cor de borda/gradiente pela prioridade
  const getPriorityStyles = () => {
    switch (solution.priority) {
      case 1:
        return "bg-gradient-to-tr from-[#0ABAB5]/80 to-[#6de2de]/60 border-[#0ABAB5] shadow-primary/10 border-2";
      case 2:
        return "bg-gradient-to-tr from-amber-100 to-amber-50 border-amber-300 border-2";
      case 3:
        return "bg-gradient-to-tr from-gray-100 to-white border-gray-200 border-2";
      default:
        return "bg-white border-gray-100";
    }
  };

  // Categoria visual badge
  const getCategoryInfo = () => {
    switch (solution.category) {
      case "revenue":
        return { label: "Receita", className: "bg-green-100 text-green-700 border-green-300" };
      case "operational":
        return { label: "Operacional", className: "bg-blue-100 text-blue-700 border-blue-300" };
      case "strategy":
        return { label: "Estratégia", className: "bg-purple-100 text-purple-700 border-purple-300" };
      default:
        return { label: "Outra", className: "bg-gray-100 text-gray-700 border-gray-300" };
    }
  };

  // Título seguro
  const safeTitle = solution.title || "Solução sem título";
  
  // Descrição segura
  const safeDescription = solution.description || 
                          solution.justification || 
                          "Recomendação personalizada para seu negócio";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl px-5 py-4 mb-0 cursor-pointer group transition-all hover:scale-[1.01]",
        getPriorityStyles()
      )}
      onClick={() => onClick(solution.solutionId)}
    >
      {solution.image_url || solution.thumbnail_url ? (
        <img
          src={solution.image_url || solution.thumbnail_url}
          alt={safeTitle}
          className="h-14 w-14 rounded-xl object-cover border-white border-2 shadow-sm shrink-0"
        />
      ) : (
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#0ABAB5] to-[#0ABAB5]/70 flex items-center justify-center text-white font-bold shrink-0 text-xl shadow-sm">
          IA
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1 gap-x-2">
          <span className={cn("text-xs font-semibold uppercase tracking-tight opacity-80", getCategoryInfo().className)}>
            {getCategoryInfo().label}
          </span>
        </div>
        <h3 className="font-semibold text-base text-gray-900 truncate group-hover:text-[#0ABAB5] transition-colors">
          {safeTitle}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {safeDescription}
        </p>
      </div>
      <ChevronRight className="h-6 w-6 text-[#0ABAB5] opacity-80 ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  );
};
