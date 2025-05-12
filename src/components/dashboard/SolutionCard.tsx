
import { Solution } from "@/hooks/dashboard/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CardThumbnail } from "./CardThumbnail";
import { CardHeader } from "./CardHeader";
import { CardContentSection } from "./CardContent";
import { CardFooterSection } from "./CardFooter";
import { SolutionCategory } from "@/lib/types/categoryTypes";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard = ({ solution, onClick }: SolutionCardProps) => {
  const handleSelect = () => {
    console.log("Card selecionado, navegando para a solução:", solution.id);
    onClick();
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:translate-y-[-3px] border border-white/5 bg-[#151823]",
        "group stat-item-enter"
      )}
      onClick={handleSelect}
    >
      <CardContent className="p-0 relative">
        <CardThumbnail thumbnailUrl={solution.thumbnail_url} />
        <div className="p-4 space-y-3">
          <CardHeader 
            category={solution.category} 
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
