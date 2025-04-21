
import { Solution } from "@/hooks/dashboard/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CardThumbnail } from "./CardThumbnail";
import { CardHeader } from "./CardHeader";
import { CardContentSection } from "./CardContent";
import { CardFooterSection } from "./CardFooter";

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
        "solution-card transition-all duration-200 cursor-pointer hover:shadow-md hover:translate-y-[-4px]", 
        solution.category
      )}
      onClick={handleSelect}
    >
      <CardContent className="p-0">
        <CardThumbnail thumbnailUrl={solution.thumbnail_url} />
        <div className="p-4 space-y-2">
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
