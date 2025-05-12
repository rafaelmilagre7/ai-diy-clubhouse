
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { SolutionCategory, categoryMapping } from "@/lib/types/categoryTypes";

interface CardHeaderProps {
  category: Solution['category']; 
  difficulty: string;
}

export const CardHeader = ({ category, difficulty }: CardHeaderProps) => {
  // Função para aplicar estilos discretos baseados na categoria
  const getCategoryStyles = () => {
    // Mapear para chaves de estilo com base na categoria
    const styleKey = Object.entries(categoryMapping).find(
      ([_, newCat]) => newCat === category
    )?.[0] || Object.keys(categoryMapping).find(
      oldCat => categoryMapping[oldCat] === category
    );
    
    switch (styleKey) {
      case "revenue":
        return "bg-neutral-700 text-white";
      case "operational":
        return "bg-neutral-700 text-white";
      case "strategy":
        return "bg-neutral-700 text-white";
      default:
        return "bg-neutral-700 text-white";
    }
  };
  
  // Tradução e estilização das categorias
  const getCategoryLabel = () => {
    // Usar comparação usando os valores padrão
    if (category === 'Receita') return "Receita";
    if (category === 'Operacional') return "Operacional";
    if (category === 'Estratégia') return "Estratégia";
    return String(category || "Categoria");
  };

  return (
    <div className="flex justify-between items-start mb-2">
      <Badge variant="outline" className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full",
        "border-0 transition-all duration-300",
        getCategoryStyles()
      )}>
        {getCategoryLabel()}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
