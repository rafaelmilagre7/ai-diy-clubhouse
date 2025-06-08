
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { CardThumbnail } from "./CardThumbnail";
import { CardHeader } from "./CardHeader";
import { CardContentSection } from "./CardContent";
import { CardFooterSection } from "./CardFooter";
import { cn } from "@/lib/utils";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard: FC<SolutionCardProps> = memo(({ 
  solution, 
  onClick 
}) => {
  return (
    <Card 
      variant="interactive"
      className={cn(
        "group cursor-pointer overflow-hidden h-full",
        "flex flex-col",
        "transition-all duration-300 ease-out",
        "hover-lift"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <CardThumbnail thumbnailUrl={solution.thumbnail_url} />
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-4 space-y-3">
        {/* Header com categoria e dificuldade */}
        <CardHeader 
          category={solution.category} 
          difficulty={solution.difficulty} 
        />
        
        {/* Título e descrição */}
        <CardContentSection
          title={solution.title}
          description={solution.description}
        />
        
        {/* Tags se existirem */}
        {solution.tags && solution.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {solution.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="badge-neutral"
              >
                {tag}
              </span>
            ))}
            {solution.tags.length > 3 && (
              <span className="badge-neutral">
                +{solution.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Spacer para empurrar footer para baixo */}
        <div className="flex-1" />
        
        {/* Footer */}
        <CardFooterSection 
          createdAt={solution.created_at}
          onSelect={onClick}
        />
      </div>
    </Card>
  );
});

SolutionCard.displayName = 'SolutionCard';
