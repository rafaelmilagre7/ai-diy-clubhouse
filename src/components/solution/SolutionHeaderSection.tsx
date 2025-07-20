
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
    <div className="space-y-6 animate-fade-in relative">
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative flex flex-wrap items-center gap-2 mb-2">
        <Badge 
          variant="outline" 
          className={cn(
            "px-3 py-1 rounded-full flex items-center",
            "bg-white/5 backdrop-blur-sm text-white border-white/10 hover:bg-white/10 transition-all duration-300"
          )}
        >
          {getCategoryIcon()}
          {getCategoryDisplayText()}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn(
            "px-3 py-1 rounded-full flex items-center backdrop-blur-sm border-white/10 hover:bg-white/5 transition-all duration-300",
            getDifficultyStyles(solution.difficulty)
          )}
        >
          {solution.difficulty === "easy" ? "Fácil" :
           solution.difficulty === "medium" ? "Médio" :
           solution.difficulty === "advanced" ? "Avançado" : solution.difficulty}
        </Badge>
        
        {/* Só mostra tempo estimado se existir e for maior que zero */}
        {solution.estimated_time && solution.estimated_time > 0 && (
          <Badge variant="outline" className="px-3 py-1 flex items-center bg-white/5 backdrop-blur-sm text-blue-400 border-blue-500/20 hover:bg-blue-500/10 transition-all duration-300">
            <Clock className="h-4 w-4 mr-1.5" />
            {solution.estimated_time} min
          </Badge>
        )}
      </div>
      
      <div className="relative">
        <h1 className="text-2xl md:text-3xl font-bold font-heading bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          {solution.title}
        </h1>
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      </div>
      
      {solution.thumbnail_url && (
        <div className="mt-6 relative overflow-hidden rounded-xl shadow-2xl max-h-[400px] group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:blur-xl"></div>
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title} 
            className="relative w-full object-cover transition-all duration-700 hover:scale-105 rounded-xl border border-white/10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-purple-500/10 opacity-60 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/10 rounded-xl"></div>
        </div>
      )}
    </div>
  );
};
