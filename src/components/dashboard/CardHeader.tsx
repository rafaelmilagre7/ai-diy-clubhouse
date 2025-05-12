
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { SolutionCategory } from "@/lib/types/categoryTypes";

interface CardHeaderProps {
  category: Solution['category']; 
  difficulty: string;
}

export const CardHeader = ({ category, difficulty }: CardHeaderProps) => {
  // Tradução e estilização das categorias
  const getCategoryLabel = () => {
    // Usar comparação usando os valores padrão
    if (category === 'Receita') return "Receita";
    if (category === 'Operacional') return "Operacional";
    if (category === 'Estratégia') return "Estratégia";
    return String(category || "Categoria");
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <Badge variant="outline" className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full",
        "bg-neutral-800/80 text-neutral-200 border-0"
      )}>
        {getCategoryLabel()}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
