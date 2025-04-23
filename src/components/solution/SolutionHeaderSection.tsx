
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

const translateDifficulty = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case "easy": return "Fácil";
    case "medium": return "Médio";
    case "advanced": return "Avançado";
    default: return difficulty;
  }
};

const getDifficultyStyles = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "advanced":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`
            px-3 py-1 rounded-full shadow-sm font-medium
            ${solution.category === "revenue" ? "bg-gradient-to-r from-revenue to-revenue-light text-white border-0" : ""}
            ${solution.category === "operational" ? "bg-gradient-to-r from-operational to-operational-light text-white border-0" : ""}
            ${solution.category === "strategy" ? "bg-gradient-to-r from-strategy to-strategy-light text-white border-0" : ""}
          `}
        >
          {solution.category === "revenue" ? "Receita" : 
           solution.category === "operational" ? "Operacional" : 
           solution.category === "strategy" ? "Estratégia" : solution.category}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn(
            "px-3 py-1 rounded-full shadow-sm font-medium border",
            getDifficultyStyles(solution.difficulty)
          )}
        >
          {translateDifficulty(solution.difficulty)}
        </Badge>
        {/* Só mostra tempo estimado se existir e for maior que zero */}
        {solution.estimated_time && solution.estimated_time > 0 && (
          <Badge variant="outline" className="px-2 py-1 bg-slate-50 text-slate-700 border-slate-200">
            {solution.estimated_time} min
          </Badge>
        )}
        {/* Só mostra taxa de sucesso se existir e for maior que zero */}
        {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
          <Badge variant="outline" className="px-2 py-1 bg-blue-50 text-blue-800 border-blue-200">
            {solution.success_rate}% sucesso
          </Badge>
        )}
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-700">
        {solution.title}
      </h1>
      
      {solution.thumbnail_url && (
        <div className="mt-6 relative overflow-hidden rounded-xl shadow-lg">
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title} 
            className="w-full h-60 object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
        </div>
      )}
    </div>
  );
};
