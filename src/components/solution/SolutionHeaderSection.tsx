
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface SolutionHeaderSectionProps {
  solution: Solution;
}

export const SolutionHeaderSection = ({ solution }: SolutionHeaderSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`
            px-3 py-1
            ${solution.category === "revenue" ? "bg-revenue/10 text-revenue border-revenue/30" : ""}
            ${solution.category === "operational" ? "bg-operational/10 text-operational border-operational/30" : ""}
            ${solution.category === "strategy" ? "bg-strategy/10 text-strategy border-strategy/30" : ""}
          `}
        >
          {solution.category === "revenue" ? "Receita" : 
           solution.category === "operational" ? "Operacional" : 
           "Estratégia"}
        </Badge>
        
        <Badge variant="outline" className="px-3 py-1 bg-gray-100">
          {solution.difficulty === "easy" ? "Fácil" :
           solution.difficulty === "medium" ? "Médio" :
           "Avançado"}
        </Badge>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold">{solution.title}</h1>
      
      <p className="text-muted-foreground">{solution.description}</p>
      
      {solution.thumbnail_url && (
        <div className="mt-6">
          <img 
            src={solution.thumbnail_url} 
            alt={solution.title} 
            className="w-full h-60 object-cover rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
};
