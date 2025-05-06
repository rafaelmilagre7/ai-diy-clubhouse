
import { Solution } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "./DifficultyBadge";
import { SolutionCategory } from "@/lib/types/categoryTypes";

interface CardHeaderProps {
  category: SolutionCategory; 
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
      case "productivity":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "marketing":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "leadership":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "finance":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "communication":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "operations":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "sales":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "customer_service":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
      case "human_resources":
        return "bg-gradient-to-r from-neutral-700 to-neutral-600 text-white";
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
        {category === "productivity" && "Produtividade"}
        {category === "marketing" && "Marketing"}
        {category === "leadership" && "Liderança"}
        {category === "finance" && "Finanças"}
        {category === "communication" && "Comunicação"}
        {category === "operations" && "Operações"}
        {category === "sales" && "Vendas"}
        {category === "customer_service" && "Atendimento"}
        {category === "human_resources" && "RH"}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
};
