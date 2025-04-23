
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CardThumbnail } from "@/components/dashboard/CardThumbnail";
import { CardHeader } from "@/components/dashboard/CardHeader";
import { CardContentSection } from "@/components/dashboard/CardContent";
import { CardFooterSection } from "@/components/dashboard/CardFooter";
import { toSolutionCategory, SolutionCategory } from "@/lib/types/appTypes";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard = ({ solution, onClick }: SolutionCardProps) => {
  const handleSelect = () => {
    console.log("Card selecionado, navegando para a solução:", solution.id);
    onClick();
  };

  // Garantir que a categoria seja um dos valores permitidos
  const normalizedCategory = toSolutionCategory(solution.category);

  // Classes de gradiente baseadas na categoria
  const categoryGradient: Record<SolutionCategory, string> = {
    revenue: "from-revenue-lighter to-white border-l-4 border-l-revenue",
    operational: "from-operational-lighter to-white border-l-4 border-l-operational",
    strategy: "from-strategy-lighter to-white border-l-4 border-l-strategy"
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl shadow-md transition-all duration-300 cursor-pointer depth-effect",
        "hover:shadow-xl hover:translate-y-[-4px]",
        "bg-gradient-to-br",
        categoryGradient[normalizedCategory]
      )}
      onClick={handleSelect}
    >
      <CardContent className="p-0 relative">
        <CardThumbnail thumbnailUrl={solution.thumbnail_url} />
        <div className="p-4 space-y-2">
          <CardHeader 
            category={normalizedCategory}
            difficulty={solution.difficulty} 
          />
          <CardContentSection 
            title={solution.title} 
            description={solution.description} 
          />
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <CardFooterSection 
          createdAt={solution.created_at} 
          onSelect={handleSelect} 
        />
      </CardFooter>
    </Card>
  );
};
