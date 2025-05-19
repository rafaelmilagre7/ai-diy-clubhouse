
import React from "react";
import { ArrowUpRight } from "lucide-react";

interface TrailCurrentSolutionCardProps {
  solution: any;
  onSelect: (id: string) => void;  // Alterado para aceitar string em vez de number
}

export const TrailCurrentSolutionCard: React.FC<TrailCurrentSolutionCardProps> = ({ 
  solution, 
  onSelect 
}) => {
  // Assegurar que o ID seja sempre tratado como string
  const handleSelect = () => {
    // Log para diagnóstico
    console.log("TrailCurrentSolutionCard selecionando solução:", {
      id: solution.solutionId || solution.id,
      title: solution.title
    });
    
    onSelect(String(solution.solutionId || solution.id));
  };
  
  return (
    <div 
      className="p-4 rounded-lg bg-gradient-to-br from-[#151823] to-[#1A1E2E] border border-white/10 hover:border-[#0ABAB5]/40 transition-all cursor-pointer shadow-md"
      onClick={handleSelect}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white mb-2">{solution.title}</h3>
          <p className="text-neutral-400 text-sm">{solution.description}</p>
          
          <div className="flex items-center gap-3 mt-3 text-sm">
            {solution.difficulty && (
              <span className="px-2 py-1 rounded-md bg-white/10 text-white/70">
                {solution.difficulty === 'easy' ? 'Fácil' : 
                 solution.difficulty === 'medium' ? 'Médio' : 
                 solution.difficulty === 'hard' ? 'Avançado' : 
                 solution.difficulty}
              </span>
            )}
            
            {solution.estimatedTime && (
              <span className="text-neutral-400">
                {solution.estimatedTime} min
              </span>
            )}
          </div>
        </div>
        
        <div className="p-2 rounded-full bg-[#0ABAB5]/20 hover:bg-[#0ABAB5]/30 transition-colors">
          <ArrowUpRight className="h-5 w-5 text-[#0ABAB5]" />
        </div>
      </div>
    </div>
  );
};
