
import React from "react";
import { Solution } from "@/lib/supabase";

interface SolutionOverviewTabProps {
  solution: Solution;
}

export const SolutionOverviewTab = ({ solution }: SolutionOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-textPrimary">Sobre esta solução</h3>
        <p className="text-textSecondary leading-relaxed whitespace-pre-wrap">
          {solution.description || solution.overview || "Descrição não disponível."}
        </p>
      </div>
      
      {solution.tags && solution.tags.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3 text-textPrimary">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/40 text-blue-200 border border-blue-700/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-textPrimary">Categoria</h4>
          <p className="text-textSecondary">{solution.category || "Não especificado"}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-textPrimary">Dificuldade</h4>
          <p className="text-textSecondary">
            {solution.difficulty === "easy" && "Fácil"}
            {solution.difficulty === "medium" && "Médio"}
            {solution.difficulty === "advanced" && "Avançado"}
            {!solution.difficulty && "Não especificado"}
          </p>
        </div>
        {solution.estimated_time && solution.estimated_time > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-textPrimary">Tempo estimado</h4>
            <p className="text-textSecondary">{solution.estimated_time} minutos</p>
          </div>
        )}
        {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-textPrimary">Taxa de sucesso</h4>
            <p className="text-textSecondary">{solution.success_rate}%</p>
          </div>
        )}
      </div>
    </div>
  );
};
