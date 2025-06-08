
import { FC, memo } from "react";
import { Solution } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { CardThumbnail } from "./CardThumbnail";
import { getCategoryConfig } from "@/lib/types/categoryTypes";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard: FC<SolutionCardProps> = memo(({ solution, onClick }) => {
  const categoryConfig = getCategoryConfig(solution.category);

  return (
    <Card 
      variant="elevated" 
      className="group overflow-hidden hover-lift transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardThumbnail 
        thumbnailUrl={solution.thumbnail_url}
        title={solution.title}
      />
      
      <div className="p-6 space-y-4">
        {/* Header com categoria e dificuldade */}
        <div className="flex items-center justify-between">
          <Badge variant={categoryConfig.badgeVariant} size="sm">
            {solution.category}
          </Badge>
          <DifficultyBadge difficulty={solution.difficulty} />
        </div>
        
        {/* Título e descrição */}
        <div className="space-y-2">
          <Text variant="card" textColor="primary" weight="semibold" className="line-clamp-2 group-hover:text-primary transition-colors">
            {solution.title}
          </Text>
          <Text variant="body" textColor="secondary" className="line-clamp-3">
            {solution.description}
          </Text>
        </div>
        
        {/* Footer com metadados */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-4 text-sm">
            {solution.estimated_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-text-tertiary" />
                <Text variant="caption" textColor="tertiary">
                  {solution.estimated_time}min
                </Text>
              </div>
            )}
            {solution.success_rate && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-text-tertiary" />
                <Text variant="caption" textColor="tertiary">
                  {solution.success_rate}% sucesso
                </Text>
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="hover-scale">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

SolutionCard.displayName = 'SolutionCard';
