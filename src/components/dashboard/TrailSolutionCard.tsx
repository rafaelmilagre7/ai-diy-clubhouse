
import React from "react";
import { ChevronRight, Gift, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BenefitBadge } from "@/components/tools/BenefitBadge";

interface TrailSolutionCardProps {
  solution: any;
  onClick: (id: string) => void;
}

export const TrailSolutionCard: React.FC<TrailSolutionCardProps> = ({ solution, onClick }) => {
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

  // Badge de prioridade
  const getPriorityBadge = () => {
    switch (solution.priority) {
      case 1:
        return <Badge className="bg-[#0ABAB5] text-white border-none shadow px-3 py-1 mr-1 animate-pulse">Alta</Badge>;
      case 2:
        return <Badge className="bg-amber-400 text-white border-none shadow px-3 py-1 mr-1">Média</Badge>;
      case 3:
        return <Badge className="bg-gray-300 text-gray-700 border-none shadow px-3 py-1 mr-1">Complementar</Badge>;
      default:
        return null;
    }
  };

  // Badge de benefício — exemplo: benefício para membro
  const benefit = solution.benefit_type
    ? <BenefitBadge type={solution.benefit_type} className="ml-2" />
    : solution.has_member_benefit
      ? <Badge className="bg-pink-100 text-pink-700 border-pink-200 flex items-center ml-2" variant="outline">
          <Gift className="h-3 w-3 mr-1" /> Benefício exclusivo
        </Badge>
      : null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl px-5 py-4 mb-0 cursor-pointer group transition-all card-hover-effect glass-effect relative overflow-hidden",
        "hover:scale-[1.035]",
        getPriorityStyles()
      )}
      style={{
        boxShadow: solution.priority === 1
          ? "0 6px 26px -6px #0ABAB533"
          : "0 2px 10px -2px #bbb4"
      }}
      onClick={() => onClick(solution.solutionId)}
    >
      <span className="absolute left-0 top-0 rounded-bl-2xl rounded-tr-xl h-2 w-28 bg-[#0ABAB5] opacity-20 pointer-events-none" style={{display: solution.priority === 1 ? undefined : "none"}} />
      {solution.image_url ? (
        <img
          src={solution.image_url}
          alt={solution.title || "Solução"}
          className="h-14 w-14 rounded-xl object-cover border-white border-2 shadow-sm shrink-0"
        />
      ) : (
        <div className="h-14 w-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0 text-xl">
          IA
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1 gap-x-2">
          {getPriorityBadge()}
          <span className={cn("text-xs font-semibold uppercase tracking-tight opacity-80", getCategoryInfo().className)}>
            {getCategoryInfo().label}
          </span>
          {benefit}
        </div>
        <h3 className="font-semibold text-base text-gray-900 truncate group-hover:text-[#0ABAB5] transition-colors">
          {solution.title || "Solução sem título"}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {solution.justification || solution.description || "Recomendação personalizada para seu negócio"}
        </p>
      </div>
      <ChevronRight className="h-6 w-6 text-[#0ABAB5] opacity-80 ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  );
};
