
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

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
           "Estratégia"}
        </Badge>
        
        <Badge variant="outline" className="px-3 py-1 rounded-full bg-gradient-to-r from-neutral-100 to-neutral-50 shadow-sm">
          {solution.difficulty === "easy" ? "Fácil" :
           solution.difficulty === "medium" ? "Médio" :
           "Avançado"}
        </Badge>
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
