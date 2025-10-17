
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { SolutionCategory } from "@/lib/types/categoryTypes";
import { BarChart, Settings, TrendingUp } from "lucide-react";

interface CardHeaderProps {
  category: Solution['category']; 
  difficulty: string;
}

export const CardHeader = ({ category, difficulty }: CardHeaderProps) => {
  // Tradução e estilização das categorias
  const getCategoryLabel = () => {
    if (category === 'Receita') return "Receita";
    if (category === 'Operacional') return "Operacional";
    if (category === 'Estratégia') return "Estratégia";
    return String(category || "Categoria");
  };
  
  // Função para obter o ícone adequado com base na categoria
  const getCategoryIcon = () => {
    if (category === 'Receita') return <TrendingUp className="h-3 w-3 mr-1.5" />;
    if (category === 'Operacional') return <Settings className="h-3 w-3 mr-1.5" />;
    if (category === 'Estratégia') return <BarChart className="h-3 w-3 mr-1.5" />;
    return null;
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <Badge variant="outline" className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center",
        "bg-surface-elevated/60 text-muted-foreground border-0"
      )}>
        {getCategoryIcon()}
        {getCategoryLabel()}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
