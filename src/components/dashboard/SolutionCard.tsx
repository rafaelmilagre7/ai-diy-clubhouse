
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CardThumbnail } from "./CardThumbnail";
import { CardHeader } from "./CardHeader";
import { CardContentSection } from "./CardContent";
import { CardFooterSection } from "./CardFooter";

interface SolutionCardProps {
  solution: Solution;
  onSelect: (id: string) => void;
}

export const SolutionCard = ({ solution, onSelect }: SolutionCardProps) => {
  const handleSelect = () => onSelect(solution.id);

  return (
    <Card className={cn("solution-card transition-all duration-200 cursor-pointer hover:translate-y-[-4px]", solution.category)}>
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
