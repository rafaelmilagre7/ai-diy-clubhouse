
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecommendedSolutionsProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const RecommendedSolutions: FC<RecommendedSolutionsProps> = ({ 
  solutions, 
  onSolutionClick 
}) => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      {/* Modern section header */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Text variant="subsection" textColor="primary" className="font-semibold">
                  Soluções recomendadas
                </Text>
                <Badge variant="accent" size="sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalizado
                </Badge>
              </div>
              <Text variant="body" textColor="secondary">
                Soluções personalizadas baseadas no seu perfil de negócio
              </Text>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <Text variant="caption" textColor="secondary" className="font-medium">
              Para você
            </Text>
          </div>
        </div>
      </Card>

      <SolutionsGrid solutions={solutions} onSolutionClick={onSolutionClick} />
    </div>
  );
};
