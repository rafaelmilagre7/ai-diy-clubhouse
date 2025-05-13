
import React from "react";
import { ChevronRight, Sparkles, Gauge, Zap } from "lucide-react";
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
        return "bg-gradient-to-tr from-[#0ABAB5]/90 to-[#34D399]/80 border-[#0ABAB5] shadow-[0_4px_15px_-2px_rgba(10,186,181,0.25)] border";
      case 2:
        return "bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border-amber-500/30 border shadow-md";
      case 3:
        return "bg-gradient-to-tr from-neutral-800/20 to-neutral-700/10 border-neutral-700/20 border shadow-sm";
      default:
        return "bg-gradient-to-tr from-neutral-900/10 to-transparent border-neutral-700/10 border";
    }
  };

  // Ícone baseado na prioridade
  const getPriorityIcon = () => {
    switch (solution.priority) {
      case 1: return <Sparkles className="h-4 w-4 text-[#0ABAB5]" />;
      case 2: return <Gauge className="h-4 w-4 text-amber-500" />;
      case 3: return <Zap className="h-4 w-4 text-neutral-400" />;
      default: return null;
    }
  };

  // Categoria visual badge
  const getCategoryInfo = () => {
    switch (solution.category) {
      case "revenue":
        return { label: "Receita", className: "bg-revenue-dark/30 text-revenue-light border-revenue/30" };
      case "operational":
        return { label: "Operacional", className: "bg-operational-dark/30 text-operational-light border-operational/30" };
      case "strategy":
        return { label: "Estratégia", className: "bg-strategy-dark/30 text-strategy-light border-strategy/30" };
      default:
        return { label: "Outra", className: "bg-gray-800/50 text-gray-300 border-gray-700/30" };
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
        "flex items-center gap-4 rounded-2xl px-5 py-4 mb-3 cursor-pointer group transition-all hover:scale-[1.01] backdrop-blur-sm",
        getPriorityStyles()
      )}
      onClick={() => onClick(solution.solutionId)}
    >
      {solution.image_url || solution.thumbnail_url ? (
        <img
          src={solution.image_url || solution.thumbnail_url}
          alt={safeTitle}
          className="h-16 w-16 rounded-xl object-cover border-[#151823]/80 border shadow-sm shrink-0"
        />
      ) : (
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#0ABAB5] to-[#34D399] flex items-center justify-center text-white font-bold shrink-0 text-xl shadow-md">
          {safeTitle.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1.5 gap-x-2">
          <Badge className={cn("px-2 py-0.5 flex items-center gap-1", getCategoryInfo().className)}>
            {getPriorityIcon()}
            <span>{getCategoryInfo().label}</span>
          </Badge>
          
          {solution.difficulty && (
            <Badge variant="neutral" className="text-xs">
              {solution.difficulty === "easy" && "Fácil"}
              {solution.difficulty === "medium" && "Médio"}
              {solution.difficulty === "advanced" && "Avançado"}
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-base text-neutral-100 group-hover:text-[#0ABAB5] transition-colors">
          {safeTitle}
        </h3>
        
        <p className="text-sm text-neutral-400 line-clamp-2 mt-1">
          {safeDescription}
        </p>
      </div>
      
      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#0ABAB5]/10 group-hover:bg-[#0ABAB5]/20 transition-colors">
        <ChevronRight className="h-5 w-5 text-[#0ABAB5] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
