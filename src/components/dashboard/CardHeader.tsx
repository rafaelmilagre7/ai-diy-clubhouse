
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
  // Função para mapear categorias antigas para os novos estilos
  const getCategoryStyles = () => {
    // Mapear para chaves de estilo com base na categoria
    const styleKey = Object.entries(categoryMapping).find(
      ([_, newCat]) => newCat === category
    )?.[0] || Object.keys(categoryMapping).find(
      oldCat => categoryMapping[oldCat] === category
    );
    
    switch (styleKey) {
      case "revenue":
        return "bg-gradient-to-r from-revenue to-revenue-light text-white shadow-sm shadow-revenue/20";
      case "operational":
        return "bg-gradient-to-r from-operational to-operational-light text-white shadow-sm shadow-operational/20";
      case "strategy":
        return "bg-gradient-to-r from-strategy to-strategy-light text-white shadow-sm shadow-strategy/20";
      default:
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white shadow-sm";
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
        "px-3 py-1 font-medium rounded-full border-0",
        "animate-slide-in transition-all duration-300",
        "hover:scale-105",
        getCategoryStyles()
      )}>
        {getCategoryLabel()}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
