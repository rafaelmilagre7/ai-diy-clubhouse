
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
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "advanced":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  // Função para obter o ícone adequado com base na categoria
  const getCategoryIcon = () => {
    if (solution.category === 'Receita') return <TrendingUp className="h-3.5 w-3.5 mr-1.5" />;
    if (solution.category === 'Operacional') return <Settings className="h-3.5 w-3.5 mr-1.5" />;
    if (solution.category === 'Estratégia') return <BarChart className="h-3.5 w-3.5 mr-1.5" />;
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
    <div className="space-y-4 animate-fade-in">
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
            "px-3 py-1 rounded-full flex items-center border",
            getDifficultyStyles(solution.difficulty)
          )}
        >
          {solution.difficulty === "easy" ? "Fácil" :
           solution.difficulty === "medium" ? "Médio" :
           solution.difficulty === "advanced" ? "Avançado" : solution.difficulty}
        </Badge>
        
        {/* Só mostra tempo estimado se existir e for maior que zero */}
        {solution.estimated_time && solution.estimated_time > 0 && (
          <Badge variant="outline" className="px-2 py-1 flex items-center bg-blue-50 text-blue-700 border-blue-100">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {solution.estimated_time} min
          </Badge>
        )}
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold font-heading text-neutral-100">
        {solution.title}
      </h1>
      
      {solution.thumbnail_url && (
        <div className="mt-6 relative overflow-hidden rounded-xl shadow-lg">
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title} 
            className="w-full h-60 object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>
      )}
    </div>
  );
};
