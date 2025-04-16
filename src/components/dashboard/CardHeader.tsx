
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";

interface CardHeaderProps {
  category: Solution['category']; 
  difficulty: string;
}

export const CardHeader = ({ category, difficulty }: CardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <Badge variant="outline" className={cn("badge-" + category)}>
        {category === "revenue" && "Receita"}
        {category === "operational" && "Operacional"}
        {category === "strategy" && "Estratégia"}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
