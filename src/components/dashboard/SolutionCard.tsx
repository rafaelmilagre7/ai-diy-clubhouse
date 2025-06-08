
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CardThumbnail } from "./CardThumbnail";
import { CardHeader } from "./CardHeader";
import { CardContentSection } from "./CardContent";
import { CardFooterSection } from "./CardFooter";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Otimização: Usar memo para evitar re-renderizações desnecessárias
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
        "hover:shadow-glow-primary"
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
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-neutral-800/40 text-neutral-400 border-0"
              >
                {tag}
              </Badge>
            ))}
            {solution.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-neutral-800/40 text-neutral-400 border-0"
              >
                +{solution.tags.length - 3}
              </Badge>
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

