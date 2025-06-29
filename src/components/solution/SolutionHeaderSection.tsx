
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SolutionCategory } from "@/lib/types/categoryTypes";
import { Clock, TrendingUp, Settings, BarChart } from "lucide-react";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

const getDifficultyStyles = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-neutral-800 text-emerald-400 border-emerald-900/30";
    case "medium":
      return "bg-neutral-800 text-amber-400 border-amber-900/30";
    case "advanced":
      return "bg-neutral-800 text-rose-400 border-rose-900/30";
    default:
      return "bg-neutral-800 text-gray-400 border-gray-700";
  }
};

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  // Função para obter o ícone adequado com base na categoria
  const getCategoryIcon = () => {
    if (solution.category === 'Receita') return <TrendingUp className="h-4 w-4 mr-1.5" />;
    if (solution.category === 'Operacional') return <Settings className="h-4 w-4 mr-1.5" />;
    if (solution.category === 'Estratégia') return <BarChart className="h-4 w-4 mr-1.5" />;
    return null;
  };

  // Função para obter o texto de exibição da categoria
  const getCategoryDisplayText = () => {
    if (solution.category === 'Receita') return "Receita";
    if (solution.category === 'Operacional') return "Operacional"; 
    if (solution.category === 'Estratégia') return "Estratégia";
    return String(solution.category);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge 
          variant="outline" 
          className={cn(
            "px-3 py-1 rounded-full flex items-center",
            "bg-neutral-800 text-white border-neutral-700"
          )}
        >
          {getCategoryIcon()}
          {getCategoryDisplayText()}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn(
            "px-3 py-1 rounded-full flex items-center",
            getDifficultyStyles(solution.difficulty)
          )}
        >
          {solution.difficulty === "easy" ? "Fácil" :
           solution.difficulty === "medium" ? "Médio" :
           solution.difficulty === "advanced" ? "Avançado" : solution.difficulty}
        </Badge>
        
        {/* Só mostra tempo estimado se existir e for maior que zero */}
        {solution.estimated_time && solution.estimated_time > 0 && (
          <Badge variant="outline" className="px-3 py-1 flex items-center bg-neutral-800 text-blue-400 border-blue-900/30">
            <Clock className="h-4 w-4 mr-1.5" />
            {solution.estimated_time} min
          </Badge>
        )}
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold font-heading text-neutral-100">
        {solution.title}
      </h1>
      
      {solution.thumbnail_url && (
        <div className="mt-6 relative overflow-hidden rounded-xl shadow-lg max-h-[400px]">
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title} 
            className="w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>
      )}
    </div>
  );
};
