
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";

interface CardHeaderProps {
  category: Solution['category']; 
  difficulty: string;
}

export const CardHeader = ({ category, difficulty }: CardHeaderProps) => {
  const getCategoryStyles = () => {
    switch (category) {
      case "revenue":
        return "bg-gradient-to-r from-revenue to-revenue-light text-white";
      case "operational":
        return "bg-gradient-to-r from-operational to-operational-light text-white";
      case "strategy":
        return "bg-gradient-to-r from-strategy to-strategy-light text-white";
      default:
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
    }
  };

  return (
    <div className="flex justify-between items-start">
      <Badge variant="outline" className={cn(
        "px-3 py-1 font-medium rounded-full border-0 shadow-sm animate-slide-in",
        getCategoryStyles()
      )}>
        {category === "revenue" && "Receita"}
        {category === "operational" && "Operacional"}
        {category === "strategy" && "Estratégia"}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
